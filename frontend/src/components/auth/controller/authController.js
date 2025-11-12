import { ToastContainer, toast } from 'react-toastify';
import {app, auth} from '../firebase'
import{
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged
} from 'firebase/auth'
import { syncUser } from '../../../services/api'

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
          console.log('⚠️ User email not verified:', user.email);
          if (onUserSynced) onUserSynced(null, user); // Pass user but with null profile
          return;
        }
        
        // User is signed in and verified - sync to backend
        try {
          const idToken = await user.getIdToken();
          const result = await syncUser(idToken);
          console.log('✅ User synced to backend:', result.profile?.id);
          if (onUserSynced) onUserSynced(result.profile, user);
        } catch (err) {
          console.error('❌ Backend sync failed:', err.message || err);
          // Still call callback even if sync fails - allow app to render
          if (onUserSynced) onUserSynced(null, user);
        }
      } else {
        // User is signed out
        console.log('🚪 User signed out');
        if (onUserSynced) onUserSynced(null, null);
      }
    } catch (error) {
      console.error('❌ Auth listener error:', error);
      // Ensure callback is always called to prevent app from hanging
      if (onUserSynced) onUserSynced(null, null);
    }
  });
};

export const registerUser = async (email, password) => {
    if (!email || !password) {
        toast.error("Email and Password Required!")
        return { success: false };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(auth.currentUser);
      // Return success with unverified status
      return { success: true, emailVerified: false, email };
    } catch (error) {
        switch(error.code){
            case 'auth/email-already-in-use':
              toast.error('Email Already in use, use another email to create account or Login.')
              break;
            case 'auth/too-many-requests':
              toast.error('The server seems to busy, please try again later!')
              break;
            default:
              toast.error(`Encountered error : ${error.code}`)
        }
        console.error(error);   
        return { success: false };
      }
  }

export const loginUser = async  (email, password) => {
    if (!email || !password){
      toast.error('Both Email and Password are required');
      return { success: false };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        return { success: true, emailVerified: false, email: userCredential.user.email };
      }
      
      // Email is verified
      toast.success(`Logged in as ${email}`)
      return { success: true, emailVerified: true }
    } catch (error) {
        switch(error.code){
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
              toast.error('Please enter email or password correctly.')
                break;
            case 'auth/wrong-password':
              toast.error('Incorrect Password! Please Try Again')
              break;
            case 'auth/too-many-requests':
              toast.error('Server is busy at the moment, please try again later')
              break;
            default:
              toast.error(`Encounter Error : ${error.code}`)
        }
      console.error(error);
      return { success: false };
    }
  }

export const logoutUser = async () => {
    try {
      await signOut(auth);
      toast.success("User logged out successfully")
      return true;
    } catch (error) {
      toast.error('Internal Server Error! Unable to Logout.')
      return false;
    }
  }

export const resetPassword = async (email) => {
    if (!email) {
      toast.error('Email Required!')
      return false;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password email sent successfully!')
      return true;
    } catch (error) {
      toast.error(`Internal Server Error , please try again later!`)
      console.error(error);
      return false;
    }
  }

// Initialize Firebase Auth provider
const provider = new GoogleAuthProvider();

// whenever a user interacts with the provider, we force them to select an account
provider.setCustomParameters({
  prompt : "select_account"
})

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    // No manual sync needed - onAuthStateChanged will handle it
    return result;
  } catch (err) {
    console.error('Google sign-in failed:', err);
    toast.error('Google sign-in failed');
    throw err;
  }
}


