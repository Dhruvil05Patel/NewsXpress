import notify from "../../../utils/toast";
import { app, auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { syncUser } from "../../../services/api";

/**
 * Central auth state listener - syncs Firebase user to backend whenever auth state changes.
 * Call this once in your App.jsx or main component to set up the listener.
 * Returns an unsubscribe function.
 */
export const initAuthListener = (onUserSynced) => {
  return onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        // User is signed in - check if email is verified
        if (!user.emailVerified) {
          console.log("⚠️ User email not verified:", user.email);
          if (onUserSynced) onUserSynced(null, user); // Pass user but with null profile
          return;
        }

        // User is signed in and verified - sync to backend
        // Immediately show basic user info from Firebase while backend syncs
        const tempProfile = {
          full_name: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email,
          avatar_url: user.photoURL || null,
        };
        if (onUserSynced) onUserSynced(tempProfile, user);

        try {
          const idToken = await user.getIdToken();
          const result = await syncUser(idToken);
          console.log("✅ User synced to backend:", result.profile?.id);
          // Update with full backend profile
          if (onUserSynced) onUserSynced(result.profile, user);
        } catch (err) {
          console.error("❌ Backend sync failed:", err.message || err);
          // Keep showing Firebase profile if backend sync fails
        }
      } else {
        // User is signed out
        console.log("🚪 User signed out");
        if (onUserSynced) onUserSynced(null, null);
      }
    } catch (error) {
      console.error("❌ Auth listener error:", error);
      // Ensure callback is always called to prevent app from hanging
      if (onUserSynced) onUserSynced(null, null);
    }
  });
};

export const registerUser = async (email, password) => {
  if (!email || !password) {
    notify.error("❌ Email and Password Required!");
    return { success: false };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(auth.currentUser);
    // Return success with unverified status
    return { success: true, emailVerified: false, email };
  } catch (error) {
    switch (error.code) {
      case "auth/email-already-in-use":
        notify.error("❌ Email already in use. Try another or login.");
        break;
      case "auth/too-many-requests":
        notify.error("⌛ Server is busy. Please try again later!");
        break;
      default:
        notify.error(`❌ Error: ${error.code}`);
    }
    console.error(error);
    return { success: false };
  }
};

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
    await sendPasswordResetEmail(auth, email);
    notify.success("📧 Password reset email sent successfully!");
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
