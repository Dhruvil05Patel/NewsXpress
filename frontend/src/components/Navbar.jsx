import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Laptop,
  Vote,
  Trophy,
  TrendingUp,
  Film,
  Heart,
  Microscope,
  Shield,
  Leaf,
  Menu,
  X,
  User,
  Search,
  Home,
} from "lucide-react";
import notify from "../utils/toast"; // toast helper

// Navbar: categories, search, profile trigger, mobile menus
export default function Navbar({
  onLoginClick,
  userProfile,
  onToggleProfile,
  searchQuery = "",
  onSearchChange,
}) {
  const location = useLocation();
  const navigate = useNavigate();

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
    Crime: "/crime",
    Live: "/live",
  };

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
    { name: "Crime", icon: Shield },
    // Live moved to the end
    { name: "Live", icon: Film },
  ];

  const gradientStyle = {
    background:
      "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
    boxShadow:
      "0 4px 12px -2px rgba(255,0,80,0.35), 0 2px 5px -1px rgba(0,0,0,0.25)",
    color: "#fff",
  };

  // Controlled search input
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      setIsSidebarVisible(true);
    } else {
      const timer = setTimeout(() => setIsSidebarVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  const handleCategoryClick = (categoryName) => {
    // navigate to category
    const route = categoryRoutes[categoryName] || "/all";
    navigate(route);
    if (sidebarOpen) setSidebarOpen(false);
  };

  return (
    <>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
        {/* Inline style for blinking LIVE label (kept minimal and scoped) */}
        <style>{`@keyframes liveBlink{0%,45%{opacity:1}50%,95%{opacity:.35}100%{opacity:1}} .live-blink{animation:liveBlink 1s linear infinite;}`}</style>
        <div className="flex items-center h-16 px-4 lg:px-6 gap-3 lg:gap-4">
          <a
            href="/"
            className="flex items-center transition-transform duration-200 hover:scale-105 shrink-0"
          >
            <img src="/Logo3.png" alt="Logo" className="h-10 w-auto lg:h-12" />
          </a>
          <div className="hidden lg:flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const route = categoryRoutes[category.name] || "/all";
              const isActive = location.pathname === route;
              const isLive = category.name === "Live";
              return (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-all whitespace-nowrap ${isActive
                      ? "border-transparent"
                      : isLive
                        ? "text-red-600 border-red-300 hover:border-red-400"
                        : "text-gray-700 border-gray-200 hover:border-[#ff9fb3]"
                    } ${isLive ? "relative" : ""}`}
                  style={
                    isActive
                      ? gradientStyle
                      : isLive
                        ? { background: "#fff5f5" }
                        : undefined
                  }
                >
                  {IconComponent ? (
                    <IconComponent
                      className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"
                        }`}
                    />
                  ) : (
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${isActive ? "" : "bg-gray-400"
                        }`}
                      style={isActive ? { background: "#fff" } : undefined}
                    />
                  )}
                  <span
                    className={`${isLive ? "live-blink font-semibold" : ""}`}
                  >
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="hidden lg:flex items-center w-[15rem] max-w-lg pt-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search headlines..."
                value={searchQuery}
                onClick={() => {
                  if (!userProfile) {
                    notify.info("Please log in to search headlines");
                    if (onLoginClick) onLoginClick();
                  }
                }}
                onChange={(e) => {
                  if (!userProfile) {
                    e.preventDefault();
                    return;
                  }
                  onSearchChange ? onSearchChange(e.target.value) : undefined;
                }}
                onFocus={(e) => {
                  if (!userProfile) return;
                  e.currentTarget.style.borderColor = "#ef4444";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(239, 68, 68, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg outline-none text-sm bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200"
                aria-label="Search headlines"
                readOnly={!userProfile}
              />
              <Search className="absolute right-3 pb-3 top-1/2 -translate-y-1/2 w-5 h-50 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {/* Mobile search */}
          <div className="flex lg:hidden items-center flex-1 w-[20rem] min-w-0 pt-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Headlines..."
                value={searchQuery}
                onClick={() => {
                  if (!userProfile) {
                    notify.info("Please log in to search headlines");
                    if (onLoginClick) onLoginClick();
                  }
                }}
                onChange={(e) => {
                  if (!userProfile) {
                    e.preventDefault();
                    return;
                  }
                  onSearchChange ? onSearchChange(e.target.value) : undefined;
                }}
                onFocus={(e) => {
                  if (!userProfile) return;
                  e.currentTarget.style.borderColor = "#ef4444";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(239, 68, 68, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.boxShadow = "none";
                }}
                className="w-full px-3 py-1.5 pr-9 border border-gray-200 rounded-lg outline-none text-sm bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200"
                aria-label="Search headlines"
                readOnly={!userProfile}
              />
              <Search className="absolute right-2.5 pb-3 top-1/2 -translate-y-1/2 w-4 h-40 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {/* Profile trigger */}
          <button
            onClick={onToggleProfile}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fef2f2";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
            className="hidden lg:inline-flex p-2 rounded-full text-gray-700 hover:text-red-600 transition-all duration-200 shrink-0"
            aria-label="Toggle profile panel"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile category sidebar */}
      {isSidebarVisible && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${sidebarOpen ? "bg-opacity-40" : "bg-opacity-0"
              }`}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`relative w-64 bg-white shadow-xl h-full p-4 flex flex-col z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Categories</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {categories.map((category) => {
                const IconComponent = category.icon;
                const route = categoryRoutes[category.name] || "/all";
                const isActive = location.pathname === route;
                const isLive = category.name === "Live";
                return (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                        ? "bg-red-50 text-red-600"
                        : isLive
                          ? "text-red-600 hover:bg-red-50"
                          : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                      }`}
                  >
                    {IconComponent ? (
                      <IconComponent
                        className={`w-4 h-4 flex-shrink-0 ${isActive
                            ? "text-red-500"
                            : isLive
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                      />
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full flex-shrink-0 ${isActive ? "bg-red-500" : "bg-gray-400"
                          }`}
                      />
                    )}
                    <span
                      className={`text-left ${isLive ? "live-blink font-semibold" : ""
                        }`}
                    >
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-md transition-all duration-200 ${sidebarOpen ? "text-red-600 scale-105" : "text-gray-600"
              }`}
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs font-medium">Categories</span>
          </button>
          <button
            onClick={() => {
              navigate("/");
              if (sidebarOpen) setSidebarOpen(false);
            }}
            className={`flex flex-col items-center space-y-1 p-2 rounded-md transition-all duration-200 ${location.pathname === "/"
                ? "text-red-600 scale-105"
                : "text-gray-600"
              }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={onToggleProfile}
            className={`flex flex-col items-center space-y-1 p-2 rounded-md transition-all duration-200 text-gray-600`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
}
