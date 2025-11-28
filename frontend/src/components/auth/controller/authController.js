import notify from "../../../utils/toast";
import { app, auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile as fbUpdateProfile,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { syncUser } from "../../../services/api";
import { sendVerificationEmail, sendResetPasswordEmail } from "../../../services/api";

/**
 * Central auth state listener - syncs Firebase user to backend whenever auth state changes.
 * Call this once in your App.jsx or main component to set up the listener.
 * Returns an unsubscribe function.
 */
export const initAuthListener = (onUserSynced) => {
  return onAuthStateChanged(auth, async (user) => {
    try {
      if (!user) {
        console.log("🚪 User logged out");
        onUserSynced(null, null);
        return;
      }

      if (!user.emailVerified) {
        console.log("⚠️ Email not verified — skipping backend sync");
        onUserSynced(null, user);
        return;
      }

      // Force token refresh to avoid stale tokens
      const idToken = await user.getIdToken(true).catch(err => {
        console.warn("⚠️ Token refresh failed, trying cached token:", err.message);
        return user.getIdToken(false); // Fallback to cached token
      });

      const backendProfile = await syncUser(idToken); // returns correct UUID profile

      if (!backendProfile) {
        console.warn("⚠️ No backend profile returned");
        onUserSynced(null, user);
        return;
      }

      console.log("🟢 Synced backend profile:", backendProfile.id);

      onUserSynced(backendProfile, user);
    } catch (err) {
      console.error("❌ initAuthListener error:", err);
      // Still pass user if we have it, even if sync failed
      onUserSynced(null, user || null);
    }
  });
};

export async function registerUser(email, password, profile = {}) {
  // profile: { username, full_name }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optionally set display name in Firebase
    if (profile.full_name) {
      try {
        await fbUpdateProfile(user, { displayName: profile.full_name });
      } catch (err) {
        console.warn("Firebase updateProfile failed:", err.message);
      }
    }

    // get ID token
    const idToken = await user.getIdToken();

    // Compose payload for backend sync. Ensure email, username and full_name sent
    const backendProfile = {
      username: profile.username || (email ? email.split("@")[0] : null),
      full_name: profile.full_name || user.displayName || null,
      email: user.email,
    };

    // Call backend to create/find profile
    const createdProfile = await syncUser(idToken, backendProfile);

    // Send verification email after successful registration
    try {
      await sendVerificationEmail(user.email, profile.full_name || "User");
      console.log("✅ Verification email sent to", user.email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email sending fails
      notify.warn("⚠️ Account created but verification email failed. Please try resending.");
    }

    return { success: true, profile: createdProfile, email: user.email };
  } catch (error) {
    console.error("registerUser error:", error);
    notify.error(error.message || "Registration failed");
    return { success: false, error: error.message || "Registration failed" };
  }
}

export const loginUser = async (email, password) => {
  if (!email || !password) {
    notify.error("❌ Both Email and Password are required");
    return { success: false };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      return {
        success: true,
        emailVerified: false,
        email: userCredential.user.email,
      };
    }

    // Email is verified
    notify.success(`✅ Logged in as ${email}`);
    return { success: true, emailVerified: true };
  } catch (error) {
    switch (error.code) {
      case "auth/user-not-found":
      case "auth/invalid-credential":
        notify.error("❌ Please enter email or password correctly.");
        break;
      case "auth/wrong-password":
        notify.error("❌ Incorrect Password! Please Try Again");
        break;
      case "auth/too-many-requests":
        notify.error("⌛ Server is busy. Please try again later");
        break;
      default:
        notify.error(`❌ Error: ${error.code}`);
    }
    console.error(error);
    return { success: false };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    notify.success("✅ Logged out successfully");
    return true;
  } catch (error) {
    notify.error("❌ Unable to logout. Please try again.");
    return false;
  }
};

export const resetPassword = async (email) => {
  if (!email) {
    notify.error("❌ Email Required!");
    return false;
  }

  try {
    await sendResetPasswordEmail(email, "User");
    return true;
  } catch (error) {
    notify.error(`❌ Server error. Please try again later!`);
    console.error(error);
    return false;
  }
};

// Initialize Firebase Auth provider
const provider = new GoogleAuthProvider();

// whenever a user interacts with the provider, we force them to select an account
provider.setCustomParameters({
  prompt: "select_account",
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // No manual sync needed - onAuthStateChanged will handle it
    return result;
  } catch (err) {
    console.error("Google sign-in failed:", err);
    notify.error("❌ Google sign-in failed");
    throw err;
  }
};

/**
 * Delete user account - removes from Firebase Auth and backend database.
 * This will cascade delete all related data (bookmarks, interactions, etc.)
 * 
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      notify.error("❌ No user logged in");
      return { success: false, message: "No user logged in" };
    }

    // Get fresh ID token
    const idToken = await user.getIdToken(true);

    // Import API function dynamically to avoid circular dependencies
    const { deleteUserAccount: deleteUserApi } = await import("../../../services/api");
    
    // Call backend to delete from database and Firebase
    const result = await deleteUserApi(idToken);

    // Sign out locally
    await signOut(auth);
    
    notify.success("✅ Account deleted successfully");
    
    // Trigger auth state change
    window.dispatchEvent(new Event("auth-state-changed"));
    
    return { success: true, message: result.message };
  } catch (error) {
    console.error("Delete account error:", error);
    
    // If backend deletion failed but we still want to try Firebase deletion
    if (error.response?.status === 500) {
      notify.error("❌ Failed to delete account from server");
    } else {
      notify.error("❌ Failed to delete account. Please try again.");
    }
    
    return { success: false, message: error.message };
  }
};
