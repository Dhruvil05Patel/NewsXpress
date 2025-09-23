import { ToastContainer, toast } from 'react-toastify';
import {app, auth} from '../firebase'
import{
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth'


export const registerUser = async (email, password) => {
    if (!email || !password) {
        toast.error("Email and Password Required!")
        return false;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(auth.currentUser);
      toast.success('Registered Successfully, please check your email!')
      return true;
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
        return false;
      }
  }

export const loginUser = async  (email, password) => {
    if (!email || !password){
      toast.error('Both Email and Password are required');
      return false;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken()
      if (!idToken){
         toast.error('Internal Serve Error!')
         return false;
      }
      toast.success(`Logged in as ${email}`)
      return true
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
      return false;
    }
  }

export const logoutUser = async () => {
    try {
      await signOut(auth);
      toast.success("User logged out successfully")
      return true;
    } catch (error) {
      toast.error('Internal Server Error')
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


export const signInWithGoogle = () => signInWithPopup(auth, provider)


