// Import all necessary components and libraries.
import SideBar from "./components/SideBar";
import AllNews from "./components/categories/AllNews";
import BusinessNews from "./components/categories/BusinessNews";
import TechnologyNews from "./components/categories/TechnologyNews";
import ScienceNews from "./components/categories/ScienceNews";
import SportsNews from "./components/categories/SportsNews";
import EnvironmentNews from "./components/categories/EnvironmentNews";
import PoliticsNews from "./components/categories/PoliticsNews";
import HealthNews from "./components/categories/HealthNews";
import EntertainmentNews from "./components/categories/EntertainmentNews";
import WorldNews from "./components/categories/WorldNews";
import CrimeNews from "./components/categories/CrimeNews";
import LoginPage from "./components/LoginPage";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// The main App component that orchestrates the entire application.
function App() {
  // State to control the visibility of the login modal.
  const [showLogin, setShowLogin] = useState(false);

  // Functions to open and close the login modal, passed as props.
  const openLogin = () => setShowLogin(true);
  const closeLogin = () => setShowLogin(false);

  return (
    // BrowserRouter enables client-side routing for the application.
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* The main sidebar and top navigation, always visible. */}
        <SideBar onLoginClick={openLogin} />

        {/* Routes define the mapping between URL paths and components. */}
        <Routes>
          {/* Redirects the user from the root URL ("/") to "/all". */}
          <Route path="/" element={<Navigate to="/all" replace />} />

          {/* Route for the main "All News" page. */}
          <Route
            path="/all"
            element={
              <AllNews
                title="Latest News"
                subtitle="Stay updated with global headlines"
              />
            }
          />
          {/* Routes for each specific news category. */}
          <Route path="/technology" element={<TechnologyNews />} />
          <Route path="/business" element={<BusinessNews />} />
          <Route path="/science" element={<ScienceNews />} />
          <Route path="/sports" element={<SportsNews />} />
          <Route path="/environment" element={<EnvironmentNews />} />
          <Route path="/politics" element={<PoliticsNews />} />
          <Route path="/health" element={<HealthNews />} />
          <Route path="/entertainment" element={<EntertainmentNews />} />
          <Route path="/world-news" element={<WorldNews />} />
          <Route path="/crime" element={<CrimeNews />} />
        </Routes>

        {/* The LoginPage modal is only rendered when showLogin is true. */}
        {showLogin && <LoginPage onClose={closeLogin} />}
      </div>
    </BrowserRouter>
  );
}

export default App;
