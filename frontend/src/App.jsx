// --- Imports ---
// Import necessary components and hooks from their respective libraries.
import { useState, useEffect } from "react";
// App.jsx: Root application shell.
// Responsibilities:
// 1. Provides routing map and lazy auth gating for protected pages.
// 2. Wraps content with global providers (Auth + Toast).
// 3. Manages transient UI state: login modal, onboarding, email verification.
// 4. Applies body scroll lock when overlays/modal are open.
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CategoryOnboarding from "./components/CategoryOnboarding";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import AllNews from "./components/AllNews";
import CategoryNews from "./components/CategoryNews";
import LoginPage from "./components/LoginPage";
import SignUp from "./components/SignUp";
import Bookmarks from "./components/Bookmarks";
import PersonalizedFeed from "./components/PersonalizedFeed";
import HelpSupport from "./components/HelpSupport";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import notify from "./utils/toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Lock } from "lucide-react";

// --- Category Configuration ---
// A centralized object to store titles and subtitles for each news category.
// This makes it easy to manage content and pass props consistently.
const categories = {
  technology: {
    title: "Technology News",
    subtitle: "The latest breakthroughs and updates from the world of tech.",
  },
  business: {
    title: "Business News",
    subtitle: "Your source for financial markets, business, and economic news.",
  },
  science: {
    title: "Science News",
    subtitle: "Explore the latest scientific discoveries and research.",
  },
  sports: {
    title: "Sports News",
    subtitle: "Scores, headlines, and stories from the world of sports.",
  },
  environment: {
    title: "Environment News",
    subtitle: "Updates on our planet, climate change, and sustainability.",
  },
  politics: {
    title: "Politics News",
    subtitle: "The latest political headlines and analysis.",
  },
  health: {
    title: "Health News",
    subtitle: "Updates on medical science, wellness, and healthcare.",
  },
  entertainment: {
    title: "Entertainment News",
    subtitle: "The latest on movies, TV shows, and celebrity news.",
  },
  crime: {
    title: "Crime News",
    subtitle: "The latest crime and justice news.",
  },
};

// AppContent: inner component separated so <AuthProvider> only wraps once at root.
// Contains all runtime logic; extracted from default export for clarity/testing.
function AppContent() {
  // --- State --- Login/Signup modal visibility.
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  // Global search query controlled by Navbar
  const [searchQuery, setSearchQuery] = useState("");
  // Loading state for resend verification email button
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  // Cooldown timer for resend verification email (in seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  // Auth context: firebaseUser = raw auth user, userProfile = enriched profile doc.
  const { user: firebaseUser, profile: userProfile, loading } = useAuth();

  // Track onboarding panel visibility (shown if profile has no categories).
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Determine if current user still needs email verification.
  const unverifiedUser =
    firebaseUser && !firebaseUser.emailVerified ? firebaseUser : null;

  // Show onboarding if profile exists but has no chosen categories.
  useEffect(() => {
    if (userProfile?.id && !unverifiedUser) {
      const hasCategories =
        Array.isArray(userProfile.categories) &&
        userProfile.categories.length > 0;
      if (!hasCategories) {
        setShowOnboarding(true);
      }
    }
  }, [userProfile, unverifiedUser]);

  // Countdown timer for resend verification email cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Lock body scroll whenever a blocking modal (login / signup / verify) is active.
  useEffect(() => {
    // Check if EITHER the Login Modal OR Signup Modal OR the Unverified User Prompt is visible
    const isAnyModalOpen = showLogin || showSignup || unverifiedUser;

    if (isAnyModalOpen) {
      document.body.classList.add("body-locked");
    } else {
      document.body.classList.remove("body-locked");
    }

    // Cleanup: Ensure the class is removed when the component unmounts or state changes
    return () => {
      document.body.classList.remove("body-locked");
    };
    // Dependency array includes all state variables that trigger a modal/overlay
  }, [showLogin, showSignup, unverifiedUser]);

  // Modal open/close handlers.
  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };
  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };
  const closeAuth = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  // Profile panel state (replaces embedded sidebar profile logic)
  const [profileOpen, setProfileOpen] = useState(false);

  // Auth gate component: lightweight inline guard for protected routes.
  const LoginRequired = ({
    title = "Login Required",
    description = "Please log in to continue.",
  }) => (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="p-2 rounded-lg bg-red-50 border border-red-100">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <button
          onClick={openLogin}
          className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
        >
          Log in to continue
        </button>
      </div>
    </div>
  );

  // --- Render --- Main router + conditional overlays.
  return (
    <BrowserRouter>
      {/* Main application container */}
      <div className="min-h-screen bg-gray-50">
        <Navbar
          onLoginClick={openLogin}
          userProfile={userProfile}
          onToggleProfile={() => setProfileOpen((p) => !p)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <Profile
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
          userProfile={userProfile}
          onLoginClick={openLogin}
        />

        {/* The Routes component defines all possible navigation paths. */}
        <Routes>
          {/* --- Core Routes --- */}
          {/* Redirect the root path "/" to "/all" for a default landing page. */}
          <Route path="/" element={<Navigate to="/all" replace />} />

          {/* Route for the main news feed showing all categories. */}
          <Route
            path="/all"
            element={
              <AllNews
                title="Latest News"
                subtitle="Stay updated with global headlines"
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />

          {/* --- Category Routes --- */}
          {/* Each route below renders the reusable CategoryNews component */}
          {/* with props tailored to a specific news category. */}
          {/* The spread operator `{...categories.technology}` passes both title and subtitle. */}

          <Route
            path="/technology"
            element={
              <CategoryNews
                category="Technology"
                {...categories.technology}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/business"
            element={
              <CategoryNews
                category="Business"
                {...categories.business}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/science"
            element={
              <CategoryNews
                category="Science"
                {...categories.science}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/sports"
            element={
              <CategoryNews
                category="Sports"
                {...categories.sports}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/environment"
            element={
              <CategoryNews
                category="Environment"
                {...categories.environment}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/politics"
            element={
              <CategoryNews
                category="Politics"
                {...categories.politics}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/health"
            element={
              <CategoryNews
                category="Health"
                {...categories.health}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/entertainment"
            element={
              <CategoryNews
                category="Entertainment"
                {...categories.entertainment}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          {/* Legacy redirect to maintain old links */}
          <Route path="/world-news" element={<Navigate to="/all" replace />} />
          <Route
            path="/crime"
            element={
              <CategoryNews
                category="Crime"
                {...categories.crime}
                userProfile={userProfile}
                onLoginClick={openLogin}
                searchQuery={searchQuery}
              />
            }
          />
          <Route
            path="/bookmarks"
            element={
              userProfile ? (
                <Bookmarks />
              ) : (
                <LoginRequired
                  title="Bookmarks"
                  description="Log in to view and manage your saved articles."
                />
              )
            }
          />
          <Route
            path="/feed/personalized"
            element={
              userProfile ? (
                <PersonalizedFeed userId={userProfile.id} />
              ) : (
                <LoginRequired
                  title="Personalized Feed"
                  description="Log in to see recommendations tailored to your interests."
                />
              )
            }
          />
          <Route
            path="/help"
            element={
              userProfile ? (
                <HelpSupport />
              ) : (
                <LoginRequired
                  title="Help & Support"
                  description="Log in to contact support and access help resources."
                />
              )
            }
          />
        </Routes>

        {/* --- Modals --- */}
        {/* The LoginPage is rendered conditionally based on the `showLogin` state. */}
        {showLogin && (
          <LoginPage onClose={closeAuth} onSwitchToSignup={openSignup} />
        )}

        {/* The SignUp page is rendered conditionally based on the `showSignup` state. */}
        {showSignup && (
          <SignUp onClose={closeAuth} onSwitchToLogin={openLogin} />
        )}

        {/* Onboarding modal for category preferences */}
        {showOnboarding && userProfile?.id && !unverifiedUser && (
          <CategoryOnboarding
            profile={userProfile}
            initialSelected={
              Array.isArray(userProfile.categories)
                ? userProfile.categories
                : []
            }
            onClose={(saved) => {
              setShowOnboarding(false);
              // Categories are now synced via AuthContext
            }}
          />
        )}

        {/* Verification prompt for unverified users */}
        {unverifiedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              {/* Header with gradient background */}
              <div
                className="text-white p-8 text-center"
                style={{
                  background:
                    "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
                }}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-5xl">
                  📧
                </div>
                <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-white/90 text-sm">We're almost there!</p>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-gray-700 text-center mb-2 leading-relaxed">
                  A verification link has been sent to:
                </p>
                <p className="text-center mb-6">
                  <strong
                    className="text-lg font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg,#ff1e1e,#ff4d4d,#ff0066)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {unverifiedUser.email}
                  </strong>
                </p>
                <p className="text-gray-500 text-sm text-center mb-8">
                  Please check your inbox (and spam folder) and click the
                  verification link to continue.
                </p>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      await unverifiedUser.reload();
                      if (unverifiedUser.emailVerified) {
                        notify.success("Email successfully verified!");
                        window.location.reload();
                      } else {
                        notify.warn(
                          "Email verification pending. Please check your inbox"
                        );
                      }
                    }}
                    className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    ✓ I've Verified - Refresh
                  </button>

                  <button
                    onClick={async () => {
                      setIsResendingVerification(true);
                      try {
                        const { sendEmailVerification } = await import(
                          "firebase/auth"
                        );
                        const { sendVerificationEmail } = await import(
                          "./services/api"
                        );
                        await sendVerificationEmail(
                          unverifiedUser.email,
                          unverifiedUser.displayName || "User"
                        );
                        notify.success(
                          "Verification email has been sent successfully"
                        );
                        setResendCooldown(30); // Start 30-second cooldown
                      } catch (error) {
                        notify.error(
                          "Failed to send verification email. Please try again"
                        );
                      } finally {
                        setIsResendingVerification(false);
                      }
                    }}
                    disabled={isResendingVerification || resendCooldown > 0}
                    className="w-full py-3 px-6 text-white font-semibold rounded-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background:
                        isResendingVerification || resendCooldown > 0
                          ? "#999"
                          : "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
                    }}
                  >
                    {isResendingVerification ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </span>
                    ) : resendCooldown > 0 ? (
                      `Resend in ${resendCooldown}s`
                    ) : (
                      "📧 Resend Verification Email"
                    )}
                  </button>

                  <button
                    onClick={async () => {
                      const { signOut } = await import("firebase/auth");
                      const { auth } = await import(
                        "./components/auth/firebase"
                      );
                      await signOut(auth);
                      notify.success("Successfully logged out");
                    }}
                    className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2800}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        pauseOnFocusLoss={false}
        theme="light"
        limit={2}
      />
    </BrowserRouter>
  );
}

// Wrap AppContent with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Export the App component to be used as the root of the application.
export default App;
