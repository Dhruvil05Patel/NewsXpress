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
import SideBar from "./components/SideBar";
import AllNews from "./components/AllNews";
import CategoryNews from "./components/CategoryNews";
import LoginPage from "./components/LoginPage";
import SignUp from "./components/SignUp";
import Bookmarks from "./components/Bookmarks";
import PersonalizedFeed from "./components/PersonalizedFeed";
import HelpSupport from "./components/HelpSupport";
import Profile from "./components/Profile";
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
        {/* The sidebar is a persistent component across all routes. */}
        <SideBar onLoginClick={openLogin} userProfile={userProfile} />

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
          <Route path="/profile" element={<Profile />} />
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
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "10px",
                maxWidth: "500px",
                textAlign: "center",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              <h2 style={{ color: "#ff9800", marginBottom: "20px" }}>
                ⚠️ Email Not Verified
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  marginBottom: "15px",
                  lineHeight: "1.6",
                }}
              >
                Your email <strong>{unverifiedUser.email}</strong> is not
                verified yet.
              </p>
              <p style={{ color: "#666", marginBottom: "25px" }}>
                Please check your inbox and click the verification link, then
                refresh this page.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={async () => {
                    await unverifiedUser.reload();
                    if (unverifiedUser.emailVerified) {
                      notify.success("✅ Email verified!");
                      window.location.reload();
                    } else {
                      notify.warn("⚠️ Please verify your email first");
                    }
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ✓ I've Verified - Refresh
                </button>
                <button
                  onClick={async () => {
                    const { sendEmailVerification } = await import(
                      "firebase/auth"
                    );
                    // Use custom backend-powered verification email instead of Firebase default template
                    const { sendVerificationEmail } = await import(
                      "./services/api"
                    );
                    await sendVerificationEmail(
                      unverifiedUser.email,
                      unverifiedUser.displayName || "User"
                    );
                    notify.success("📧 Verification email resent!");
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  📧 Resend Email
                </button>
                <button
                  onClick={async () => {
                    const { signOut } = await import("firebase/auth");
                    const { auth } = await import("./components/auth/firebase");
                    await signOut(auth);
                    notify.info("👋 Logged out");
                  }}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Logout
                </button>
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
