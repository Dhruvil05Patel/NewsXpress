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
  const [showVerificationWait, setShowVerificationWait] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Submit: attempt login, show verification screen if needed
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Login flow
    const result = await loginUser(email, password);
    setIsLoading(false);

    if (result.success && !result.emailVerified) {
      // User logged in but email not verified
      setVerificationEmail(result.email);
      setShowVerificationWait(true);
    } else if (result.success && result.emailVerified) {
      // Success - verified user
      onClose();
      setTimeout(() => {
        window.dispatchEvent(new Event("auth-state-changed"));
      }, 100);
    }
  };

  // Re-check email verification without leaving modal
  const handleRefreshAfterVerification = async () => {
    setIsLoading(true);
    await auth.currentUser?.reload();

    if (auth.currentUser?.emailVerified) {
      notify.success("✅ Email verified! Welcome!");
      setShowVerificationWait(false);
      onClose();
      setTimeout(() => {
        window.dispatchEvent(new Event("auth-state-changed"));
      }, 100);
    } else {
      notify.warn("⚠️ Email not verified yet. Please check your inbox.");
    }
    setIsLoading(false);
  };

  // Resend verification email to current user
  const handleResendVerification = async () => {
    try {
      const { sendVerificationEmail } = await import("../services/api");
      await sendVerificationEmail(
        auth.currentUser.email,
        auth.currentUser.displayName || "User"
      );
      notify.success("📧 Verification email resent!");
    } catch (error) {
      notify.error("❌ Failed to resend email. Please try again.");
    }
  };

  // Show verification waiting screen
  if (showVerificationWait) {
    return (
      <>
        <div className="overlay">
          <div className="modal">
            <button className="close-btn" onClick={onClose}>
              &times;
            </button>

            <div style={{ textAlign: "center", padding: "20px" }}>
              <h2>📧 Verify Your Email</h2>
              <p
                style={{
                  margin: "20px 0",
                  fontSize: "16px",
                  lineHeight: "1.6",
                }}
              >
                We've sent a verification email to:
                <br />
                <strong>{verificationEmail}</strong>
              </p>
              <p style={{ color: "#666", marginBottom: "20px" }}>
                Please check your inbox and click the verification link.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "30px",
                }}
              >
                <button
                  className="login-btn"
                  onClick={handleRefreshAfterVerification}
                  disabled={isLoading}
                  style={{ backgroundColor: "#4CAF50" }}
                >
                  {isLoading ? "Checking..." : "✓ I've Verified - Refresh"}
                </button>

                <button
                  className="login-btn"
                  onClick={handleResendVerification}
                  style={{ backgroundColor: "#2196F3" }}
                >
                  📧 Resend Verification Email
                </button>

                <button
                  onClick={() => setShowVerificationWait(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

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
                    notify.error("❌ Enter your email above first");
                    return;
                  }
                  if (isLoading) return;

                  setIsLoading(true);
                  try {
                    const success = await resetPassword(email);
                    if (success) {
                      notify.info(
                        "📧 If the email exists, a reset mail was sent."
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
