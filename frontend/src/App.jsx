// --- Imports ---
// Import necessary components and hooks from their respective libraries.
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import AllNews from "./components/AllNews";
import CategoryNews from "./components/CategoryNews";
import LoginPage from "./components/LoginPage";
import Bookmarks from "./components/Bookmarks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initAuthListener } from "./components/auth/controller/authController";

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
  world: {
    title: "World News",
    subtitle: "Global headlines from around the world.",
  },
  crime: {
    title: "Crime News",
    subtitle: "The latest crime and justice news.",
  },
};

/**
 * The main App component that sets up the application layout and routing.
 */
function App() {
  // --- State Management ---
  // State to control the visibility of the login modal.
  const [showLogin, setShowLogin] = useState(false);
  
  // State to store the current user profile (synced from backend)
  const [userProfile, setUserProfile] = useState(null);
  
  // State to track unverified user
  const [unverifiedUser, setUnverifiedUser] = useState(null);

  // --- Auth Listener Setup ---
  // Set up Firebase auth state listener on component mount
  useEffect(() => {
    const unsubscribe = initAuthListener((profile, user) => {
      if (user && !user.emailVerified) {
        // User logged in but not verified
        setUnverifiedUser(user);
        setUserProfile(null);
      } else if (profile) {
        // User verified and synced
        setUserProfile(profile);
        setUnverifiedUser(null);
      } else {
        // User logged out
        setUserProfile(null);
        setUnverifiedUser(null);
      }
    });
    
    // Cleanup: unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

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
              <CategoryNews category="Technology" {...categories.technology} />
            }
          />
          <Route
            path="/business"
            element={
              <CategoryNews category="Business" {...categories.business} />
            }
          />
          <Route
            path="/science"
            element={
              <CategoryNews category="Science" {...categories.science} />
            }
          />
          <Route
            path="/sports"
            element={<CategoryNews category="Sports" {...categories.sports} />}
          />
          <Route
            path="/environment"
            element={
              <CategoryNews
                category="Environment"
                {...categories.environment}
              />
            }
          />
          <Route
            path="/politics"
            element={
              <CategoryNews category="Politics" {...categories.politics} />
            }
          />
          <Route
            path="/health"
            element={<CategoryNews category="Health" {...categories.health} />}
          />
          <Route
            path="/entertainment"
            element={
              <CategoryNews
                category="Entertainment"
                {...categories.entertainment}
              />
            }
          />
          <Route
            path="/world-news"
            element={<CategoryNews category="World" {...categories.world} />}
          />
          <Route
            path="/crime"
            element={<CategoryNews category="Crime" {...categories.crime} />}
          />
          <Route path="/bookmarks" element={<Bookmarks />} />
        </Routes>

        {/* --- Modals --- */}
        {/* The LoginPage is rendered conditionally based on the `showLogin` state. */}
        {showLogin && <LoginPage onClose={closeLogin} />}
        
        {/* Verification prompt for unverified users */}
        {unverifiedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#ff9800', marginBottom: '20px' }}>⚠️ Email Not Verified</h2>
              <p style={{ fontSize: '16px', marginBottom: '15px', lineHeight: '1.6' }}>
                Your email <strong>{unverifiedUser.email}</strong> is not verified yet.
              </p>
              <p style={{ color: '#666', marginBottom: '25px' }}>
                Please check your inbox and click the verification link, then refresh this page.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={async () => {
                    await unverifiedUser.reload();
                    if (unverifiedUser.emailVerified) {
                      toast.success('✅ Email verified!');
                      window.location.reload();
                    } else {
                      toast.warning('⚠️ Please verify your email first');
                    }
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ✓ I've Verified - Refresh
                </button>
                <button
                  onClick={async () => {
                    const { sendEmailVerification } = await import('firebase/auth');
                    await sendEmailVerification(unverifiedUser);
                    toast.success('📧 Verification email resent!');
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  📧 Resend Email
                </button>
                <button
                  onClick={async () => {
                    const { signOut } = await import('firebase/auth');
                    const { auth } = await import('./components/auth/firebase');
                    await signOut(auth);
                    toast.info('Logged out');
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
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
        autoClose={3000} // duration in ms
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </BrowserRouter>
  );
}

// Export the App component to be used as the root of the application.
export default App;
