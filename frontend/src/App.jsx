// --- Imports ---
// Import necessary components and hooks from their respective libraries.
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CategoryOnboarding from "./components/CategoryOnboarding";
import SideBar from "./components/SideBar";
import AllNews from "./components/AllNews";
import CategoryNews from "./components/CategoryNews";
import LoginPage from "./components/LoginPage";
import Bookmarks from "./components/Bookmarks";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import notify from "./utils/toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

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

/**
 * The main App component that sets up the application layout and routing.
 */
function AppContent() {
  // --- State Management ---
  // State to control the visibility of the login modal.
  const [showLogin, setShowLogin] = useState(false);

  // Get auth state from AuthContext
  const { user: firebaseUser, profile: userProfile, loading } = useAuth();

  // State to track unverified user
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Determine if we have an unverified user
  const unverifiedUser = firebaseUser && !firebaseUser.emailVerified ? firebaseUser : null;

  // --- Show onboarding if user has no categories ---
  useEffect(() => {
    if (userProfile?.id && !unverifiedUser) {
      const hasCategories = Array.isArray(userProfile.categories) && userProfile.categories.length > 0;
      if (!hasCategories) {
        setShowOnboarding(true);
      }
    }
  }, [userProfile, unverifiedUser]);

  // --- Effect Hook to Prevent Background Scrolling ---
  // This logic is purely CSS/DOM manipulation and does NOT touch Firebase Auth.
  useEffect(() => {
    // Check if EITHER the Login Modal OR the Unverified User Prompt is visible
    const isAnyModalOpen = showLogin || unverifiedUser;

    if (isAnyModalOpen) {
      document.body.classList.add("body-locked");
    } else {
      document.body.classList.remove("body-locked");
    }

    // Cleanup: Ensure the class is removed when the component unmounts or state changes
    return () => {
      document.body.classList.remove("body-locked");
    };
    // Dependency array includes both state variables that trigger a modal/overlay
  }, [showLogin, unverifiedUser]);

  // --- Event Handlers ---
  // Functions to toggle the login modal's visibility.
  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  // --- Render ---
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
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Routes>

        {/* --- Modals --- */}
        {/* The LoginPage is rendered conditionally based on the `showLogin` state. */}
        {showLogin && <LoginPage onClose={closeLogin} />}

        {/* Onboarding modal for category preferences */}
        {showOnboarding && userProfile?.id && !unverifiedUser && (
          <CategoryOnboarding
            profile={userProfile}
            initialSelected={Array.isArray(userProfile.categories) ? userProfile.categories : []}
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
                    await sendEmailVerification(unverifiedUser);
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
