// --- Imports ---
import React, { useState, useEffect, useRef } from "react";
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
  Bookmark,
  User,
  Search,
  Home,
  Bell,
} from "lucide-react";
import { logoutUser } from "./auth/controller/authController";
import {
  updateProfile as apiUpdateProfile,
  checkUsernameAvailability,
} from "../services/api";
import notify from "../utils/toast";

// SideBar: responsive navigation, category links, profile overlay
const SideBar = ({ onLoginClick, userProfile }) => {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Category routes
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
  };

  // State
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(true);

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
  ];

  // --- Handlers ---
  const handleCategoryClick = (categoryName) => {
    const route = categoryRoutes[categoryName] || "/all";
    navigate(route);
    if (sidebarOpen) setSidebarOpen(false);
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleHelpClick = () => {
    notify.info("❓ Redirecting to Help & Support...");
    navigate("/help");
    setIsProfileSidebarOpen(false);
  };

  const handleNotificationToggle = (enabled) => {
    console.log(`Notifications ${enabled ? "enabled" : "disabled"}`);
    setNotifications(enabled);
  };

  // --- Effects ---
  useEffect(() => {
    if (sidebarOpen) {
      setIsSidebarVisible(true);
    } else {
      const timer = setTimeout(() => setIsSidebarVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  // Overlay remains open for guests as well; no auto-close on logout

  // --- Reusable UI Component ---

  // ToggleSwitch (Existing)
  const ToggleSwitch = ({ enabled, setEnabled, label, Icon }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? "bg-red-500" : "bg-gray-200"
          }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"
            }`}
        />
      </button>
    </div>
  );

  // (Removed unused SelectPreference component)

  // ProfileActionButton (Existing)
  const ProfileActionButton = ({ label, Icon, onClick }) => {
    return (
      <button
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateX(4px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateX(0)";
        }}
        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg 
                    text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200
                    transition-all duration-200"
      >
        <Icon className="w-5 h-5 text-gray-500" />
        <span>{label}</span>
      </button>
    );
  };

  const ProfileSection = () => {
    // Local UI state for settings forms inside profile panel
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [editingUsername, setEditingUsername] = useState(false);
    const [newName, setNewName] = useState(userProfile?.full_name || "");
    const [newUsername, setNewUsername] = useState(userProfile?.username || "");
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState(null);
    const fileInputRef = useRef(null);
    const [saving, setSaving] = useState(false);

    // Sync displayed name with latest profile as soon as it changes
    useEffect(() => {
      setNewName(userProfile?.full_name || "");
      setNewUsername(userProfile?.username || "");
    }, [userProfile?.full_name, userProfile?.username]);

    const handleSaveName = async () => {
      if (!userProfile?.id) {
        notify.error("No profile found. Please login again.");
        return;
      }
      setSaving(true);
      try {
        const payload = { full_name: newName };
        const updated = await apiUpdateProfile(userProfile.id, payload);
        notify.success("Full name updated");
        window.dispatchEvent(new Event("profile-updated"));
        setEditingName(false);
      } catch (err) {
        console.error("Failed to update full name:", err);
        notify.error("Failed to save full name");
      } finally {
        setSaving(false);
      }
    };

    const handleSaveUsername = async () => {
      if (!userProfile?.id) {
        notify.error("No profile found. Please login again.");
        return;
      }

      // Check username availability first
      if (!usernameAvailable) {
        notify.error("This username is already taken. Please choose another.");
        return;
      }

      if (!newUsername || newUsername.trim() === "") {
        notify.error("Username cannot be empty.");
        return;
      }

      setSaving(true);
      try {
        const payload = { username: newUsername.trim() };
        const updated = await apiUpdateProfile(userProfile.id, payload);
        notify.success("Username updated successfully");
        window.dispatchEvent(new Event("profile-updated"));
        setEditingUsername(false);
      } catch (err) {
        console.error("Failed to update username:", err);
        const errorMsg =
          err.response?.data?.error || err.message || "Failed to save username";
        notify.error(errorMsg);
      } finally {
        setSaving(false);
      }
    };

    // Check username availability with debounce
    useEffect(() => {
      if (
        !editingUsername ||
        !newUsername ||
        newUsername === userProfile?.username
      ) {
        setUsernameAvailable(true);
        return;
      }

      const timeoutId = setTimeout(async () => {
        if (newUsername.trim() === "") {
          setUsernameAvailable(false);
          return;
        }

        setCheckingUsername(true);
        try {
          const result = await checkUsernameAvailability(
            newUsername.trim(),
            userProfile?.id
          );
          setUsernameAvailable(result.available);
        } catch (err) {
          console.error("Error checking username:", err);
          setUsernameAvailable(false);
        } finally {
          setCheckingUsername(false);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }, [newUsername, editingUsername, userProfile?.username, userProfile?.id]);

    const handleUploadChange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setUploadPreview(url);
      setSelectedFileName(file.name);
      // In a real app, you would upload the file to backend / storage here.
      notify.info("Selected profile picture (preview)");
    };

    return (
      <div className="p-6 space-y-6 bg-white h-full">
        {/* Display Section */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-5 border border-red-100 transition-all duration-300 hover:shadow-md">
          <h3 className="text-base font-bold text-gray-900 mb-3 tracking-tight">
            Profile
          </h3>
          <div className="flex items-center space-x-4">
            {userProfile?.avatar_url ? (
              <img
                src={userProfile.avatar_url}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-red-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                {(
                  (
                    userProfile?.full_name ||
                    userProfile?.displayName ||
                    "G"
                  ).charAt(0) || "G"
                ).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 text-base">
                {userProfile?.full_name || "Guest User"}
              </p>
              <p className="text-xs text-gray-600">
                {userProfile?.email || ""}
              </p>
              <p className="text-xs text-gray-600">
                @{userProfile?.username || "unknown"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions (Bookmarks & Personalized Feed) - visible only when logged in */}
        {userProfile && (
          <div className="space-y-2">
            <ProfileActionButton
              label="Bookmarks"
              Icon={Bookmark}
              onClick={() => {
                navigate("/bookmarks");
              }}
            />
            <ProfileActionButton
              label="Personalized Feed"
              Icon={TrendingUp}
              onClick={() => {
                navigate("/feed/personalized");
              }}
            />
          </div>
        )}

        {/* Settings Section with dropdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-gray-900">
              Profile Settings
            </h4>
            <button
              onClick={() => {
                if (!userProfile) return handleLoginClick();
                setShowSettingsPanel((s) => !s);
              }}
              className="text-sm text-red-600 font-semibold"
            >
              {showSettingsPanel ? "Close" : "Open"}
            </button>
          </div>

          {showSettingsPanel && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200 shadow-sm">
              {/* Edit Full Name */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Full Name</div>
                  <button
                    onClick={() => setEditingName((v) => !v)}
                    className="text-xs text-gray-600"
                  >
                    {editingName ? "Cancel" : "Edit"}
                  </button>
                </div>

                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      aria-label="Edit full name"
                      placeholder="Enter your full name"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-3 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-60"
                      disabled={saving}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700">
                    {userProfile?.full_name || "Not set"}
                  </div>
                )}
              </div>

              {/* Edit Username */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Username</div>
                  <button
                    onClick={() => setEditingUsername((v) => !v)}
                    className="text-xs text-gray-600"
                  >
                    {editingUsername ? "Cancel" : "Edit"}
                  </button>
                </div>

                {editingUsername ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-md text-sm ${checkingUsername
                          ? "border-gray-300"
                          : newUsername &&
                            newUsername !== userProfile?.username
                            ? usernameAvailable
                              ? "border-green-500 focus:ring-green-500"
                              : "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                          }`}
                        aria-label="Edit username"
                        placeholder="Enter your username"
                      />
                      <button
                        onClick={handleSaveUsername}
                        className="px-3 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-60"
                        disabled={
                          saving ||
                          !usernameAvailable ||
                          checkingUsername ||
                          !newUsername.trim()
                        }
                      >
                        Save
                      </button>
                    </div>
                    {checkingUsername &&
                      newUsername &&
                      newUsername !== userProfile?.username && (
                        <p className="text-xs text-gray-500">
                          Checking availability...
                        </p>
                      )}
                    {!checkingUsername &&
                      newUsername &&
                      newUsername !== userProfile?.username && (
                        <p
                          className={`text-xs ${usernameAvailable
                            ? "text-green-600"
                            : "text-red-600"
                            }`}
                        >
                          {usernameAvailable
                            ? "✓ Username is available"
                            : "✗ Username is already taken"}
                        </p>
                      )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-700">
                    @{userProfile?.username || "Not set"}
                  </div>
                )}
              </div>

              {/* Help & Support */}
              <div>
                <button
                  onClick={handleHelpClick}
                  className="w-full px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md border border-red-100 font-medium shadow-sm hover:bg-red-100 transition"
                >
                  Help & Support
                </button>
              </div>

              {/* Notifications */}
              <div>
                <ToggleSwitch
                  enabled={notifications}
                  setEnabled={handleNotificationToggle}
                  label="Notifications"
                  Icon={Bell}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Render ---
  return (
    <>
      {/* Top Navigation Bar: Logo • Categories • Search • Profile */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center h-16 px-4 lg:px-6 gap-3 lg:gap-4">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center transition-transform duration-200 hover:scale-105 shrink-0"
          >
            <img
              src="/Logo3.png"
              alt="Today's Headlines Logo"
              className="h-10 w-auto lg:h-12"
            />
          </a>

          {/* Categories - desktop only */}
          <div className="hidden lg:flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const route = categoryRoutes[category.name] || "/all";
              const isActive = location.pathname === route;
              return (
                <button
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-all whitespace-nowrap ${isActive
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "text-gray-700 border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                    }`}
                >
                  {IconComponent ? (
                    <IconComponent
                      className={`w-4 h-4 ${isActive ? "text-red-500" : "text-gray-500"
                        }`}
                    />
                  ) : (
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${isActive ? "bg-red-500" : "bg-gray-400"
                        }`}
                    />
                  )}
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search - desktop only */}
          <div className="hidden lg:flex items-center w-[15rem] max-w-lg pt-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search headlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => {
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
              />
              <Search className="absolute right-3 pb-3 top-1/2 -translate-y-1/2 w-5 h-50 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Bar - mobile view */}
          <div className="flex lg:hidden items-center flex-1 w-[20rem] min-w-0 pt-3">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search Headlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => {
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
              />
              <Search className="absolute right-2.5 pb-3 top-1/2 -translate-y-1/2 w-4 h-40 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Profile Icon - visible on large screens */}
          <button
            onClick={() => {
              setIsProfileSidebarOpen((prev) => !prev);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fef2f2";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
            className="hidden lg:inline-flex p-2 rounded-full text-gray-700 hover:text-red-600 transition-all duration-200 shrink-0"
            aria-label="Toggle profile and settings"
          >
            <User className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Desktop-only Left Sidebar removed as redundant */}

      {/* Mobile-only Left Sidebar (for Categories) */}
      {isSidebarVisible && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Overlay */}
          <div
            className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${sidebarOpen ? "bg-opacity-40" : "bg-opacity-0"
              }`}
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar Panel */}
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
                return (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                      ? "bg-red-50 text-red-600"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                      }`}
                  >
                    {IconComponent ? (
                      <IconComponent
                        className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-red-500" : "text-gray-600"
                          }`}
                      />
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full flex-shrink-0 ${isActive ? "bg-red-500" : "bg-gray-400"
                          }`}
                      />
                    )}
                    <span className="text-left">{category.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile-only Right Sidebar (for Profile) */}
      <div
        className={`lg:hidden fixed inset-0 z-60 flex justify-end ${isProfileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        {/* Overlay */}
        <div
          className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${isProfileSidebarOpen
            ? "bg-opacity-40"
            : "bg-opacity-0 pointer-events-none"
            }`}
          onClick={() => setIsProfileSidebarOpen(false)}
        />
        {/* Profile Panel */}
        <div
          className={`relative w-[30rem] bg-white shadow-xl h-full flex flex-col z-70 transition-transform duration-300 ease-in-out ${isProfileSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-base font-bold text-gray-900">
              Profile & Settings
            </h3>
            <button
              onClick={() => setIsProfileSidebarOpen(false)}
              className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto">
            <ProfileSection />
          </div>
          <div className="p-4 border-t">
            {!userProfile ? (
              <button
                onClick={handleLoginClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(239, 68, 68, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(239, 68, 68, 0.2)";
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md"
              >
                Login to Save Preferences
              </button>
            ) : (
              <button
                onClick={async () => {
                  try {
                    await logoutUser();
                    window.location.reload();
                  } catch (error) {
                    console.error("Logout error:", error);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(55, 65, 81, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(55, 65, 81, 0.2)";
                }}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop-only Right Sidebar (for Profile & bookmarks) */}
      <aside
        className={`
            hidden xl:block fixed right-0 top-16 bottom-0 w-[30rem] bg-white 
            border-l border-gray-200 overflow-y-auto z-70 
            transition-transform duration-300 ease-in-out
            ${isProfileSidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-base font-bold text-gray-900">
            Profile & Settings
          </h3>
          <button
            onClick={() => setIsProfileSidebarOpen(false)}
            className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            aria-label="Close profile sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto">
          <ProfileSection />
        </div>
        <div className="p-4 border-t">
          {!userProfile ? (
            <button
              onClick={handleLoginClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(239, 68, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(239, 68, 68, 0.2)";
              }}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md"
            >
              Login to Save Preferences
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  await logoutUser();
                  window.location.reload();
                } catch (error) {
                  console.error("Logout error:", error);
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(55, 65, 81, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(55, 65, 81, 0.2)";
              }}
              className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-md flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                  clipRule="evenodd"
                />
              </svg>
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Mobile-only Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden">
        <div className="flex justify-around items-center h-16">
          {/* Categories Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-md transition-all duration-200 ${sidebarOpen ? "text-red-600 scale-105" : "text-gray-600"
              }`}
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs font-medium">Categories</span>
          </button>

          {/* Home Button */}
          <button
            onClick={() => {
              navigate("/");
              if (sidebarOpen) setSidebarOpen(false);
              if (isProfileSidebarOpen) setIsProfileSidebarOpen(false);
            }}
            className={`flex flex-col items-center space-y-1 p-2 rounded-md transition-all duration-200 ${location.pathname === "/"
              ? "text-red-600 scale-105"
              : "text-gray-600"
              }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              setIsProfileSidebarOpen((prev) => !prev);
            }}
            className={`flex flex-col items-center space-y-1 p-2 rounded-md transition-all duration-200 ${isProfileSidebarOpen ? "text-red-600 scale-105" : "text-gray-600"
              }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideBar;
