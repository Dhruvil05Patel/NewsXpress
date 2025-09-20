import React, { useState, useEffect } from "react"; //Importing essential node modules
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

// Main sidebar component for navigation and categories
const SideBar = () => {
  // State for tracking which category is currently selected
  const [activeCategory, setActiveCategory] = useState("All");
  // State for showing/hiding language dropdown menu
  const [languageDropdown, setLanguageDropdown] = useState(false);
  // State for mobile sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State for controlling mobile sidebar visibility animations
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  // Array of all news categories with their icons
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

  // Function to handle category selection
  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    // Close mobile sidebar when category is selected
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Effect to control mobile sidebar visibility with animation timing
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
      {/* Top navigation bar - fixed at the top */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo section */}
          <div className="flex items-center space-x-2 mx-5">
            <img
              src="/Logo3.png"
              alt="NewsXpress Logo"
              className=" h-10 w-auto object-contain"
            />
          </div>
          {/* Right side of navbar - language and login */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Language dropdown - only visible on desktop */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setLanguageDropdown(!languageDropdown)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <span>🇺🇸 English</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {/* Language dropdown menu */}
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
            {/* Login button - only visible on desktop */}
            <button className="hidden lg:block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              Login
            </button>
            {/* Mobile menu toggle button */}
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

      {/* Desktop sidebar - always visible on large screens */}
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-20">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Categories
          </h3>
          {/* Desktop category navigation */}
          <nav className="space-y-1">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isActive = activeCategory === category.name;
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
                  {/* Category icon or dot for "All" */}
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

      {/* Mobile sidebar container - only visible on mobile */}
      {isSidebarVisible && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop overlay */}
          <div
            className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${
              sidebarOpen ? "bg-opacity-40" : "bg-opacity-0"
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Mobile sidebar panel */}
          <div
            className={`relative w-64 bg-white shadow-xl h-full p-4 flex flex-col z-50 transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Mobile category section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Categories
              </h3>
              {/* Mobile category navigation */}
              <nav className="space-y-1">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isActive = activeCategory === category.name;
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
                      {/* Category icon or dot for "All" */}
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
              {/* Mobile language selection */}
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
              {/* Mobile login button */}
              <button className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
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