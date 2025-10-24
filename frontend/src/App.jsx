// --- Imports ---
// Import necessary components and hooks from their respective libraries.
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import AllNews from "./components/AllNews";
import CategoryNews from "./components/CategoryNews";
import LoginPage from "./components/LoginPage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
        <SideBar onLoginClick={openLogin} />

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
            element={<CategoryNews category="Business" {...categories.business} />}
          />
          <Route
            path="/science"
            element={<CategoryNews category="Science" {...categories.science} />}
          />
          <Route
            path="/sports"
            element={<CategoryNews category="Sports" {...categories.sports} />}
          />
          <Route
            path="/environment"
            element={
              <CategoryNews category="Environment" {...categories.environment} />
            }
          />
          <Route
            path="/politics"
            element={<CategoryNews category="Politics" {...categories.politics} />}
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
        </Routes>

        {/* --- Modals --- */}
        {/* The LoginPage is rendered conditionally based on the `showLogin` state. */}
        {showLogin && <LoginPage onClose={closeLogin} />}
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}       // duration in ms
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