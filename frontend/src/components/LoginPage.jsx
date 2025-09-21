import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerUser, loginUser, resetPassword, signInWithGoogle } from './auth/controller/authController'




const authWithGoogle = async ()  => {
        const response = await signInWithGoogle();
        console.log(response);
}


// A modal component for handling both user login and registration.
function LoginPage({ onClose }) {
  // State to toggle between login (true) and signup (false) forms.
  const [isLogin, setIsLogin] = useState(true);

  // State for all form input fields.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handles form submission for both login and signup.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const success = await loginUser(email, password);
      if(success){
        setTimeout(() => {
          onClose()
        }, 4000)
      }
    } else {
      if (password !== confirmPassword) {
        toast.error("❌ Passwords do not match!");
        return;
      }
      const success = await registerUser(email, password)
      if(success){
        setTimeout(() => {
          onClose()
        }, 4000)
        toast.success(`🎉 Welcome, ${name}`);
      }

      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setName('')
      setDob('')
    }
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 relative animate-fadeIn">
          {/* Close Button */}
          <button
            className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-500"
            onClick={onClose}
          >
            &times;
          </button>

          {/* Conditionally render Login or Signup form based on isLogin state */}
          {isLogin ? (
            <>
              {/* Login Form */}
              <h2 className="text-2xl font-bold mb-6 text-center">
                Login to <span className="text-red-600">NewsXpress</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block font-medium mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Show Password Checkbox */}
                <div className="w-full flex items-center justify-between gap-2">
                  <div className="show-password-container space-x-1">
                  <input
                    type="checkbox"
                    id="showPassLogin"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="showPassLogin" className="text-sm">
                     Show Password
                  </label>
                  </div>
                  <button
                  type="button"
                  onClick={() => resetPassword(email)}
                  className="text-black py-2 rounded-lg font-semibold hover:underline transition"
                  >
                  Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  onClick={() => authWithGoogle()}
                >
                  Login With Google
              </button>
              </form>
              

              {/* Link to switch to the Signup form */}
              <p className="text-center text-sm mt-4">
                Don’t have an account?{" "}
                <button
                  className="text-red-600 font-semibold hover:underline"
                  onClick={() => setIsLogin(false)}
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Signup Form */}
              <h2 className="text-2xl font-bold mb-6 text-center">
                Create an <span className="text-red-600">Account</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block font-medium mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Real-time password mismatch warning */}
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600">
                    ❌ Passwords do not match
                  </p>
                )}

                {/* Show Password Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPassSignup"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="showPassSignup" className="text-sm">
                    Show Password
                  </label>
                </div>

                {/* Submit Button (disabled if passwords don't match) */}
                <button
                  type="submit"
                  disabled={confirmPassword && password !== confirmPassword}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign Up
                </button>
              </form>

              {/* Link to switch back to the Login form */}
              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <button
                  className="text-red-600 font-semibold hover:underline"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </p>
              
            </>
          )}
        </div>
      </div>

      {/* Container for toast notifications */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}

export default LoginPage;
