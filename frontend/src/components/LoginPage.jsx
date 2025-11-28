// Login modal: handles sign-in and email verification flow
import React, { useState } from "react";
import notify from "../utils/toast";
import "../assets/LoginPage.css";
import { loginUser, resetPassword } from "./auth/controller/authController";
import { auth } from "./auth/firebase";

function LoginPage({ onClose, onSwitchToSignup }) {
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Submit: attempt login, show verification screen if needed
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Login flow
    const result = await loginUser(email, password);
    setIsLoading(false);

    if (result.success) {
      // Close login modal - App.jsx will handle verification if needed
      onClose();
      setTimeout(() => {
        window.dispatchEvent(new Event("auth-state-changed"));
      }, 100);
    }
  };

  return (
    <>
      <div className="overlay">
        <div className="modal">
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>

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

            <div
              className="checkbox-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="checkbox"
                  id="showPassLogin"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label htmlFor="showPassLogin">Show Password</label>
              </div>

              <button
                type="button"
                className="forgot-password-btn"
                style={{
                  background: "none",
                  border: "none",
                  color: "#2196F3",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "0.9rem",
                }}
                onClick={async () => {
                  if (!email) {
                    notify.error("Please enter your email address first");
                    return;
                  }
                  if (isLoading) return;

                  setIsLoading(true);
                  try {
                    const success = await resetPassword(email);
                    if (success) {
                      notify.info(
                        "Password reset instructions have been sent to your email"
                      );
                    }
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="signup-text">
            Don't have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToSignup();
              }}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
