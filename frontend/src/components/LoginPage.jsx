import React, { useState } from "react";
import notify from "../utils/toast";
import "../assets/LoginPage.css";
import {
  registerUser,
  loginUser,
  resetPassword,
} from "./auth/controller/authController";
import { auth } from "./auth/firebase";

function App({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [showVerificationWait, setShowVerificationWait] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // New state for age error
  const [ageError, setAgeError] = useState("");

  // Password validation checks
  const passwordChecks = [
    { id: 1, label: "At least 8 characters", valid: password.length >= 8 },
    { id: 2, label: "1 uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { id: 3, label: "1 lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { id: 4, label: "1 number (0-9)", valid: /\d/.test(password) },
    {
      id: 5,
      label: "1 special character (!@#$...)",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  // Instagram-like username rules:
  // - Allowed: letters, numbers, underscores, periods
  // - No spaces or other special characters
  // - Cannot start/end with a period
  // - No consecutive periods
  // - Max length: 30
  const usernameChecks = [
    {
      id: 1,
      label: "Only letters, numbers, underscores, periods",
      valid: username ? /^[A-Za-z0-9._]+$/.test(username) : false,
    },
    {
      id: 2,
      label: "No spaces",
      valid: username ? !/\s/.test(username) : false,
    },
    {
      id: 3,
      label: "Does not start or end with a period",
      valid: username
        ? !username.startsWith(".") && !username.endsWith(".")
        : false,
    },
    {
      id: 4,
      label: "No consecutive periods",
      valid: username ? !/\.{2,}/.test(username) : false,
    },
    {
      id: 5,
      label: "Max 30 characters",
      valid: username ? username.length <= 30 : false,
    },
    {
      id: 6,
      label: "Starts with letter or number",
      valid: username ? /^[A-Za-z0-9]/.test(username) : false,
    },
  ];
  const usernameValid = username && usernameChecks.every((c) => c.valid);

  // Age validation function (NEW)
  const isOldEnough = (dobString) => {
    if (!dobString) return false;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 13;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAgeError(""); // Clear previous age error

    if (isLogin) {
      // Login flow
      const result = await loginUser(email, password);
      setIsLoading(false);

      if (result.success && !result.emailVerified) {
        // User logged in but email not verified
        setVerificationEmail(result.email);
        setShowVerificationWait(true);
      } else if (result.success && result.emailVerified) {
        // Success - verified user
        setIsOpen(false);
        onClose?.();
        // Small delay to ensure auth state has propagated
        setTimeout(() => {
          window.dispatchEvent(new Event("auth-state-changed"));
        }, 100);
      }
    } else {
      // Signup flow

      // 1. Age Validation Check (NEW)
      if (!isOldEnough(dob)) {
        setAgeError("❌ You must be at least 13 years old to sign up.");
        notify.error("❌ You must be at least 13 years old!");
        setIsLoading(false);
        return;
      }

      // 2. Password Match Check
      if (password !== confirmPassword) {
        notify.error("❌ Passwords do not match!");
        setIsLoading(false);
        return;
      }

      // 3. Password Rules Check
      const allValid = passwordChecks.every((check) => check.valid);
      if (!allValid) {
        notify.error("❌ Please satisfy all password requirements!");
        setIsLoading(false);
        return;
      }

      // 4. Registration
      const result = await registerUser(email, password, {
        username: username,
        full_name: fullName,
      });
      setIsLoading(false);

      if (result.success) {
        // Show verification waiting screen
        setVerificationEmail(result.email);
        setShowVerificationWait(true);
      }
    }
  };

  // Reset form when switching modes
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setFullName("");
    setDob("");
    setShowPassword(false);
    setAgeError(""); // Reset age error
  };

  const handleRefreshAfterVerification = async () => {
    setIsLoading(true);
    // NOTE: This Firebase Auth line remains untouched.
    await auth.currentUser?.reload();

    if (auth.currentUser?.emailVerified) {
      notify.success("✅ Email verified! Welcome!");
      setShowVerificationWait(false);
      setIsOpen(false);
      onClose?.();
      // Small delay to ensure auth state has propagated
      setTimeout(() => {
        window.dispatchEvent(new Event("auth-state-changed"));
      }, 100);
    } else {
      notify.warn("⚠️ Email not verified yet. Please check your inbox.");
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    try {
      const { sendVerificationEmail } = await import("../services/api");
      console.log("Resending verification email to:", auth.currentUser.email);
      await sendVerificationEmail(
        auth.currentUser.email,
        auth.currentUser.displayName || "User"
      );
      notify.success("📧 Verification email resent!");
    } catch (error) {
      notify.error("❌ Failed to resend email. Please try again.");
    }
  };

  if (!isOpen) return null;

  // Show verification waiting screen
  if (showVerificationWait) {
    return (
      <>
        <div className="overlay">
          <div className="modal">
            <button
              className="close-btn"
              onClick={() => {
                setShowVerificationWait(false);
                setIsOpen(false);
                onClose?.();
              }}
            >
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
                  onClick={() => {
                    setShowVerificationWait(false);
                    resetForm();
                    setIsLogin(true);
                  }}
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
        {/* Toast container is provided globally in App.jsx */}
      </>
    );
  }

  return (
    <>
      <div className="overlay">
        <div className="modal">
          <button
            className="close-btn"
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
          >
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

                <button
                  type="submit"
                  className="login-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
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
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="off"
                  formNoValidate
                />

                <label>Username</label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  required
                  autoComplete="off"
                  formNoValidate
                  maxLength={30}
                />
                {username && (
                  <ul className="password-rules" style={{ marginTop: "6px" }}>
                    {usernameChecks
                      .filter((check) => !check.valid)
                      .map((check) => (
                        <li key={check.id} className="rule-text">
                          ❌ {check.label}
                        </li>
                      ))}
                    {usernameValid && (
                      <li className="rule-text" style={{ color: "#16a34a" }}>
                        ✅ Username looks good
                      </li>
                    )}
                  </ul>
                )}

                <label>Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    setAgeError(""); // Clear error on change
                  }}
                  required
                />

                {/* Age Validation Error Display (NEW) */}
                {dob && !isOldEnough(dob) && (
                  <p className="error-text">❌ Must be 13 years or older.</p>
                )}
                {ageError && <p className="error-text">{ageError}</p>}

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
                    (confirmPassword && password !== confirmPassword) ||
                    isLoading ||
                    !isOldEnough(dob) ||
                    !usernameValid
                  }
                >
                  {isLoading ? "Signing up..." : "Sign Up"}
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

      {/* Toast container is provided globally in App.jsx */}
    </>
  );
}

export default App;
