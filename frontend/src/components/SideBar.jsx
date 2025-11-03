// --- Imports ---
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
    Menu,
    X,
    Bookmark,
    User,
    Search,
    Home,
} from "lucide-react";

/**
 * A responsive component that renders a top navbar, a desktop sidebar,
 * and a mobile bottom navigation bar for category and profile management.
 * @param {object} props - The component's props.
 * @param {Function} props.onLoginClick - Function to call when the login button is clicked.
 */
const SideBar = ({ onLoginClick }) => {
    // --- Hooks ---
    const location = useLocation();
    const navigate = useNavigate();

    // --- Data & Configuration ---
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

    // --- State Management ---
    const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // --- Mock Data (for demonstration) ---
    const [userProfile] = useState({
        name: "Guest User",
        avatar: null,
    });

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

    // --- Handlers ---
    const handleCategoryClick = (categoryName) => {
        const route = categoryRoutes[categoryName] || "/all";
        navigate(route);
        if (sidebarOpen) setSidebarOpen(false);
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

    // --- Reusable UI Component ---
    const ProfileSection = () => {
        // --- MODIFIED ---
        // Check if the current page is the bookmarks page
        const isBookmarksActive = location.pathname === "/bookmarks";

        return (
            <div className="p-6 space-y-6">
                {/* User Profile Display */}
                <div className="bg-gray-50 rounded-xl p-5">
                    <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight">
                        Profile
                    </h3>
                    <div className="flex items-center space-x-4">
                        {userProfile.avatar ? (
                            <img
                                src={userProfile.avatar}
                                alt="Profile"
                                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                                <User className="w-7 h-7 text-white" />
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">
                                {userProfile.name}
                            </p>
                            <p className="text-xs text-gray-500">Explore trending news</p>
                        </div>
                    </div>
                </div>

                {/* --- MODIFIED --- */}
                {/* This button will now highlight when active */}
                <button
                    onClick={() => {
                        navigate("/bookmarks"); // Changed to lowercase
                        setIsProfileSidebarOpen(false);
                    }}
                    className={`
                        w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg 
                        transition-all duration-200 border
                        ${isBookmarksActive
                            ? "bg-red-50 text-red-600 border-red-200" // Active state
                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-200" // Inactive state
                        }
                    `}
                >
                    {/* Icon is already red, which looks good for both states */}
                    <Bookmark className="w-5 h-5 text-red-500" />
                    <span>My bookmarks</span>
                </button>

                {/* Login Button */}
                <button
                    onClick={onLoginClick}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm"
                >
                    Login to Save Preferences
                </button>
            </div>
        );
    };

    // --- Render ---
    return (
        <>
            {/* Top Navigation Bar (Visible on all screen sizes) */}
            <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
                <div className="relative flex items-center lg:justify-between px-4 h-16">
                    {/* App Logo - centered on mobile, left on desktop */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:relative lg:inset-auto lg:justify-start">
                        <a
                            href="/"
                            className="flex items-center space-x-2 pointer-events-auto"
                        >
                            <img
                                src="/Logo3.png"
                                alt="Today's Headlines Logo"
                                className="h-12 w-auto"
                            />
                        </a>
                    </div>

                    {/* Centered on desktop, hidden on mobile */}
                    <div className="hidden lg:flex flex-1 justify-center px-8">
                        <div className="relative w-full max-w-lg">
                            <input
                                type="text"
                                placeholder="Search headlines..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white focus:bg-white"
                                aria-label="Search headlines"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Profile Icon - right on mobile, right on desktop */}
                    <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 lg:relative lg:right-auto lg:top-auto lg:translate-y-0">
                        <button
                            onClick={() => setIsProfileSidebarOpen((prev) => !prev)}
                            className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle profile and settings"
                        >
                            <User className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Desktop-only Left Sidebar (for Categories) */}
            <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-20">
                <div className="p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-6 tracking-tight">
                        Categories
                    </h3>
                    <nav className="space-y-2">
                        {categories.map((category) => {
                            const IconComponent = category.icon;
                            const route = categoryRoutes[category.name] || "/all";
                            const isActive = location.pathname === route;
                            return (
                                <button
                                    key={category.name}
                                    onClick={() => handleCategoryClick(category.name)}
                                    className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                            ? "bg-red-50 text-red-600 border-l-4 border-red-500"
                                            : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    {IconComponent ? (
                                        <IconComponent
                                            className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-red-500" : "text-gray-500"
                                                }`}
                                        />
                                    ) : (
                                        <div
                                            className={`w-5 h-5 rounded-full flex-shrink-0 ${isActive ? "bg-red-500" : "bg-gray-400"
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
                                className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-gray-100"
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
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                className={`lg:hidden fixed inset-0 z-40 flex justify-end ${isProfileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
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
                    className={`relative w-80 bg-white shadow-xl h-full flex flex-col z-50 transition-transform duration-300 ease-in-out ${isProfileSidebarOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-base font-bold text-gray-900">
                            Profile & Settings
                        </h3>
                        <button
                            onClick={() => setIsProfileSidebarOpen(false)}
                            className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="overflow-y-auto">
                        <ProfileSection />
                    </div>
                </div>
            </div>

            {/* Desktop-only Right Sidebar (for Profile & bookmarks) */}
            <aside
                className={`
                hidden xl:block fixed right-0 top-16 bottom-0 w-80 bg-white 
                border-l border-gray-200 overflow-y-auto z-20 
                transition-transform duration-300 ease-in-out
                ${isProfileSidebarOpen ? "translate-x-0" : "translate-x-full"}
            `}
            >
                <ProfileSection />
            </aside>

            {/* Mobile-only Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden">
                <div className="flex justify-around items-center h-16">
                    {/* Categories Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={`flex flex-col items-center space-y-1 p-2 rounded-md ${sidebarOpen ? "text-red-600" : "text-gray-600"
                            }`}
                    >
                        <Menu className="w-6 h-6" />
                        <span className="text-xs font-medium">Categories</span>
                    </button>

                    {/* --- MODIFIED --- */}
                    {/* Home Button now closes sidebars */}
                    <button
                        onClick={() => {
                            navigate("/");
                            if (sidebarOpen) setSidebarOpen(false);
                            if (isProfileSidebarOpen) setIsProfileSidebarOpen(false);
                        }}
                        className={`flex flex-col items-center space-y-1 p-2 rounded-md ${location.pathname === "/" ? "text-red-600" : "text-gray-600"
                            }`}
                    >
                        <Home className="w-6 h-6" />
                        <span className="text-xs font-medium">Home</span>
                    </button>

                    {/* Profile Button */}
                    <button
                        onClick={() => setIsProfileSidebarOpen((prev) => !prev)}
                        className={`flex flex-col items-center space-y-1 p-2 rounded-md ${isProfileSidebarOpen ? "text-red-600" : "text-gray-600"
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
