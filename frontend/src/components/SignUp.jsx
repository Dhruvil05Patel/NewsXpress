// Signup modal: handles registration and email verification flow
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
    const [showVerificationWait, setShowVerificationWait] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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

    // Username validation
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

    // Age validation
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

    // Submit: validate inputs then register
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setAgeError("");

        // 1. Age Validation Check
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
            setVerificationEmail(result.email);
            setShowVerificationWait(true);
        }
    };

    // Re-check verification without leaving modal
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

    // Verification overlay
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
                                    ← Back to Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Form UI
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
