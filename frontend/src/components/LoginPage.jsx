import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/LoginPage.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [dob, setDob] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  // Password validation checks
  const passwordChecks = [
    { id: 1, label: "At least 8 characters", valid: password.length >= 8 },
    { id: 2, label: "1 uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { id: 3, label: "1 lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { id: 4, label: "1 number (0-9)", valid: /\d/.test(password) },
    { id: 5, label: "1 special character (!@#$...)", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      toast.success(`✅ Logged in as ${email}`);
    } else {
      if (password !== confirmPassword) {
        toast.error("❌ Passwords do not match!");
        return;
      }
      // Check if all password rules are satisfied
      const allValid = passwordChecks.every((check) => check.valid);
      if (!allValid) {
        return; // Don't show toast here; user already sees the feedback
      }
      toast.success(`🎉 Welcome, ${username}!`);
    }
  };

  // Reset form when switching modes
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setDob("");
    setShowPassword(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay">
        <div className="modal">
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            &times;
          </button>

          {isLogin ? (
            <>
              <h2>
                Login to <span className="brand">NewsXpress</span>
              </h2>
              <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="showPassLogin"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label htmlFor="showPassLogin">Show Password</label>
                </div>

                <button type="submit" className="login-btn">
                  Login
                </button>
              </form>

              <p className="signup-text">
                Don’t have an account?{" "}
                <a
                  href="#"
                  onClick={() => {
                    resetForm();
                    setIsLogin(false);
                  }}
                >
                  Sign up
                </a>
              </p>
            </>
          ) : (
            <>
              <h2>
                Create an <span className="brand">Account</span>
              </h2>
              <form onSubmit={handleSubmit}>
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <label>Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />

                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {/* Password rule feedback */}
                {password && (
                  <ul className="password-rules">
                    {passwordChecks
                      .filter((check) => !check.valid)
                      .map((check) => (
                        <li key={check.id} className="rule-text">
                          ❌ {check.label}
                        </li>
                      ))}
                  </ul>
                )}

                <label>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {confirmPassword && password !== confirmPassword && (
                  <p className="error-text">❌ Passwords do not match</p>
                )}

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    id="showPassSignup"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label htmlFor="showPassSignup">Show Password</label>
                </div>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={
                    confirmPassword && password !== confirmPassword
                  }
                >
                  Sign Up
                </button>
              </form>

              <p className="signup-text">
                Already have an account?{" "}
                <a
                  href="#"
                  onClick={() => {
                    resetForm();
                    setIsLogin(true);
                  }}
                >
                  Login
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}

export default App;
