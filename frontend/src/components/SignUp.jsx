// SignUp: registration + validation + email verify prompt after creation
// SignUp: registration + validation + email verify prompt after creation
import React, { useState } from "react";
import notify from "../utils/toast";
import "../assets/LoginPage.css";
import { registerUser } from "./auth/controller/authController";
import { auth } from "./auth/firebase";

function SignUp({ onClose, onSwitchToLogin }) {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ageError, setAgeError] = useState("");

  // Password rules
  // Password rules
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

  // Username rules
  // Username rules
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
      id: 4.5,
      label: "Minimum 5 characters",
      valid: username ? username.length >= 5 : false,
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

  // Full Name validation (do not sanitize input; allow typing anything):
  // Constraints: non-empty, starts with a letter, only letters & spaces, length < 50.
  const fullNameChecks = [
    { id: 1, label: "Starts with a letter", valid: /^[A-Za-z]/.test(fullName) },
    { id: 2, label: "Only letters and spaces", valid: /^[A-Za-z ]+$/.test(fullName) },
    { id: 3, label: "Less than 50 characters", valid: fullName.length < 50 },
    { id: 4, label: "Not empty", valid: fullName.trim().length > 0 }
  ];
  const fullNameValid = fullName && fullNameChecks.every(c => c.valid);

  // Age check
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

  // Handle submit
  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAgeError("");

    // 1. Age Validation Check
    if (!isOldEnough(dob)) {
      setAgeError("You must be at least 13 years old to create an account.");
      notify.error("Registration requires users to be 13 years or older");
      setIsLoading(false);
      return;
    }

    // 2. Password Match Check
    if (password !== confirmPassword) {
      notify.error("Passwords do not match. Please try again");
      setIsLoading(false);
      return;
    }

    // 3. Password Rules Check
    const allValid = passwordChecks.every((check) => check.valid);
    if (!allValid) {
      notify.error("Please ensure all password requirements are met");
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
      notify.success("Account created! Please verify your email to continue");
      onClose(); // Close signup modal and let App.jsx show verification modal
    }
  };

  // Render
  // Render
  return (
    <>
      <div className="overlay">
        <div className="modal">
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>

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
            {fullName && (
              <ul className="password-rules" style={{ marginTop: "6px" }}>
                {fullNameChecks.filter(check => !check.valid).map(check => (
                  <li key={check.id} className="rule-text">❌ {check.label}</li>
                ))}
                {fullNameValid && (
                  <li className="rule-text" style={{ color: "#16a34a" }}>
                    ✅ Full Name looks good
                  </li>
                )}
              </ul>
            )}

            <label>Username</label>
            <input
              type="text"
              placeholder="Choose a username (min 5 chars)"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              required
              autoComplete="off"
              formNoValidate
              maxLength={30}
            />
            {username && username.length < 5 && (
              <p className="error-text" style={{ marginTop: "4px" }}>❌ Username must be at least 5 characters.</p>
            )}
            {username && username.length >= 5 && (
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
                setAgeError("");
              }}
              required
            />

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
                !usernameValid ||
                !fullNameValid
              }
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="signup-text">
            Already have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin();
              }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default SignUp;