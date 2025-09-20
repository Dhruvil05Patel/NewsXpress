import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Laptop,
  Vote,
  Trophy,
  TrendingUp,
  Film,
  Globe,
  Heart,
  Microscope,
  Shield,
  Leaf,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

// A responsive top navbar and sidebar for category navigation.
const SideBar = ({ onLoginClick }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Maps category names to their URL routes.
  const categoryRoutes = {
    All: "/all",
    Technology: "/technology",
    Business: "/business",
    Science: "/science",
    Sports: "/sports",
    Environment: "/environment",
    Politics: "/politics",
    Health: "/health",
    Entertainment: "/entertainment",
    "World News": "/world-news",
    Crime: "/crime",
  };

  // State for UI toggles: language dropdown and mobile sidebar visibility.
  const [languageDropdown, setLanguageDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Data source for all navigation categories and their icons.
  const categories = [
    { name: "All", icon: null },
    { name: "Technology", icon: Laptop },
    { name: "Business", icon: TrendingUp },
    { name: "Science", icon: Microscope },
    { name: "Sports", icon: Trophy },
    { name: "Environment", icon: Leaf },
    { name: "Politics", icon: Vote },
    { name: "Health", icon: Heart },
    { name: "Entertainment", icon: Film },
    { name: "World News", icon: Globe },
    { name: "Crime", icon: Shield },
  ];

  // Navigates to a category and closes the mobile menu.
  const handleCategoryClick = (categoryName) => {
    const route = categoryRoutes[categoryName] || "/all";
    navigate(route);
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Manages the mobile sidebar's slide-out animation timing.
  useEffect(() => {
    if (sidebarOpen) {
      setIsSidebarVisible(true);
    } else {
      const timer = setTimeout(() => setIsSidebarVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  return (
    <>
      {/* Top navigation bar (always visible) */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2 mx-15">
            <img
              src="/Logo3.png"
              alt="NewsXpress Logo"
              className="h-10 w-auto object-contain"
            />
          </a>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop-only actions */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setLanguageDropdown(!languageDropdown)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <span>🇺🇸 English</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {languageDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    🇺🇸 English
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    🇪🇸 Spanish
                  </button>
                  <button className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    🇫🇷 French
                  </button>
                </div>
              )}
            </div>
            <button
              className="hidden lg:block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={onLoginClick}
            >
              Login
            </button>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop-only sidebar */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-20">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Categories
          </h3>
          <nav className="space-y-1">
            {categories.map((category) => {
              const IconComponent = category.icon;
              // Determines if the link is active to apply special styling.
              const route = categoryRoutes[category.name] || "/all";
              const isActive = location.pathname === route;
              return (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-red-50 text-red-600 border-r-2 border-red-500"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {IconComponent ? (
                    <IconComponent
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? "text-red-500" : "text-gray-600"
                      }`}
                    />
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full flex-shrink-0 ${
                        isActive ? "bg-red-500" : "bg-gray-400"
                      }`}
                    />
                  )}
                  <span className="text-left">{category.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile-only sidebar with overlay */}
      {isSidebarVisible && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop to close menu on click */}
          <div
            className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${
              sidebarOpen ? "bg-opacity-40" : "bg-opacity-0"
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sliding sidebar panel */}
          <div
            className={`relative w-64 bg-white shadow-xl h-full p-4 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Categories
              </h3>
              <nav className="space-y-1">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const route = categoryRoutes[category.name] || "/all";
                  const isActive = location.pathname === route;
                  return (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-red-50 text-red-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {IconComponent ? (
                        <IconComponent
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? "text-red-500" : "text-gray-600"
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-full flex-shrink-0 ${
                            isActive ? "bg-red-500" : "bg-gray-400"
                          }`}
                        />
                      )}
                      <span className="text-left">{category.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile bottom section - language and login */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 px-3">
                  Language
                </h3>
                <div className="space-y-1">
                  <button className="w-full text-left flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <span>🇺🇸</span>
                    <span>English</span>
                  </button>
                  <button className="w-full text-left flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <span>🇪🇸</span>
                    <span>Spanish</span>
                  </button>
                  <button className="w-full text-left flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                    <span>🇫🇷</span>
                    <span>French</span>
                  </button>
                </div>
              </div>
              <button
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                onClick={onLoginClick}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
