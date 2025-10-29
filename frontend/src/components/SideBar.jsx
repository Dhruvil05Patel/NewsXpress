// --- Imports ---
// Import React hooks for state and side effects.
import React, { useState, useEffect } from "react";
// Import hooks from react-router-dom for navigation and location tracking.
import { useLocation, useNavigate } from "react-router-dom";
// Import icons from the lucide-react library for the UI.
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
    // Gets the current URL location to highlight the active category.
    const location = useLocation();
    // Provides a function to programmatically navigate between routes.
    const navigate = useNavigate();

    // --- Data & Configuration ---
    // Maps category names to their corresponding URL routes for navigation.
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
    // State for the right-side mobile profile panel.
    const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
    const [isMobileProfileVisible, setIsMobileProfileVisible] = useState(false); // Controls rendering for animations.

    // State for the left-side mobile category sidebar.
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Controls rendering for animations.

    // State for the search input field.
    const [searchQuery, setSearchQuery] = useState("");

    // --- Mock Data (for demonstration) ---
    // A static array representing saved user bookmarks.
    const [bookmarks] = useState([
        { id: 1, title: "Breaking: Tech Innovation Summit 2025" },
        { id: 2, title: "Global Climate Action Updates" },
        { id: 3, title: "Sports Championship Finals" },
    ]);

    // A static object for the current user's profile information.
    const [userProfile] = useState({
        name: "Guest User",
        avatar: null, // Can be set to an image URL.
    });

    // An array of category objects, each with a name and an associated icon.
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
    /**
     * Navigates to the selected category's route and closes the mobile sidebar.
     * @param {string} categoryName - The name of the category to navigate to.
     */
    const handleCategoryClick = (categoryName) => {
        const route = categoryRoutes[categoryName] || "/all";
        navigate(route);
        if (sidebarOpen) setSidebarOpen(false); // Close mobile sidebar on selection.
    };

    // --- Effects ---
    // Manages the mounting/unmounting of the left mobile sidebar for smooth animations.
    useEffect(() => {
        if (sidebarOpen) {
            setIsSidebarVisible(true);
        } else {
            // Wait for the closing animation to finish before removing from the DOM.
            const timer = setTimeout(() => setIsSidebarVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [sidebarOpen]);

    // Manages the mounting/unmounting of the right mobile profile panel for animations.
    useEffect(() => {
        if (isMobileProfileOpen) {
            setIsMobileProfileVisible(true);
        } else {
            // Wait for the closing animation to finish before removing from the DOM.
            const timer = setTimeout(() => setIsMobileProfileVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isMobileProfileOpen]);


    // --- Reusable UI Component ---
    /**
     * A reusable component that renders the user profile, bookmarks, search bar,
     * and login button. Used in both desktop and mobile sidebars.
     */
    const ProfileSection = () => (
        <div className="p-6 space-y-6">
            {/* User Profile Display */}
            <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight">Profile</h3>
                <div className="flex items-center space-x-4">
                    {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                            <User className="w-7 h-7 text-white" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-gray-900 text-sm">{userProfile.name}</p>
                        <p className="text-xs text-gray-500">Explore trending news</p>
                    </div>
                </div>
            </div>

            {/* Bookmarks Section */}
            <div>
                <div className="flex items-center space-x-2 mb-4">
                    <Bookmark className="w-5 h-5 text-red-500" />
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">Bookmarks</h3>
                </div>
                <div className="space-y-3">
                    {bookmarks.length > 0 ? (
                        bookmarks.map((bookmark) => (
                            <div key={bookmark.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <p className="text-sm text-gray-700 line-clamp-2">{bookmark.title}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 italic">No bookmarks yet</p>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div>
                <h3 className="text-base font-bold text-gray-900 mb-4 tracking-tight">Search News</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search headlines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                    <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Login Button */}
            <button
                onClick={onLoginClick}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-sm"
            >
                Login to Save Preferences
            </button>
        </div>
    );

    // --- Render ---
    return (
        <>
            {/* Top Navigation Bar (Visible on all screen sizes) */}
            <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200">
                <div className="relative flex items-center justify-between lg:justify-start px-4 h-16">
                    {/* App Logo - centered on mobile, left on desktop */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:relative lg:inset-auto lg:justify-start">
                        <a href="/" className="flex items-center space-x-2 pointer-events-auto">
                            <img src="/Logo3.png" alt="Today's Headlines Logo" className="h-12 w-auto" />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Desktop-only Left Sidebar (for Categories) */}
            <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-20">
                <div className="p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-6 tracking-tight">Categories</h3>
                    <nav className="space-y-2">
                        {categories.map((category) => {
                            const IconComponent = category.icon;
                            const route = categoryRoutes[category.name] || "/all";
                            const isActive = location.pathname === route;
                            return (
                                <button key={category.name} onClick={() => handleCategoryClick(category.name)} className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? "bg-red-50 text-red-600 border-l-4 border-red-500" : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"}`}>
                                    {IconComponent ? <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-red-500" : "text-gray-500"}`} /> : <div className={`w-5 h-5 rounded-full flex-shrink-0 ${isActive ? "bg-red-500" : "bg-gray-400"}`} />}
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
                    <div className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${sidebarOpen ? "bg-opacity-40" : "bg-opacity-0"}`} onClick={() => setSidebarOpen(false)} />
                    {/* Sidebar Panel */}
                    <div className={`relative w-64 bg-white shadow-xl h-full p-4 flex flex-col z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-bold text-gray-900">Categories</h3>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="space-y-1">
                            {categories.map((category) => {
                                const IconComponent = category.icon;
                                const route = categoryRoutes[category.name] || "/all";
                                const isActive = location.pathname === route;
                                return (
                                    <button key={category.name} onClick={() => handleCategoryClick(category.name)} className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? "bg-red-50 text-red-600" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                                        {IconComponent ? <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-red-500" : "text-gray-600"}`} /> : <div className={`w-4 h-4 rounded-full flex-shrink-0 ${isActive ? "bg-red-500" : "bg-gray-400"}`} />}
                                        <span className="text-left">{category.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Mobile-only Right Sidebar (for Profile) */}
            {isMobileProfileVisible && (
                <div className="lg:hidden fixed inset-0 z-40 flex justify-end">
                    {/* Overlay */}
                    <div className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${isMobileProfileOpen ? "bg-opacity-40" : "bg-opacity-0"}`} onClick={() => setIsMobileProfileOpen(false)} />
                    {/* Profile Panel */}
                    <div className={`relative w-80 bg-white shadow-xl h-full flex flex-col z-50 transition-transform duration-300 ease-in-out ${isMobileProfileOpen ? "translate-x-0" : "translate-x-full"}`}>
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-base font-bold text-gray-900">Profile & Settings</h3>
                            <button onClick={() => setIsMobileProfileOpen(false)} className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto">
                            <ProfileSection />
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop-only Right Sidebar (for Profile & Bookmarks) */}
            <aside className="hidden xl:block fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto z-20">
                <ProfileSection />
            </aside>

            {/* Mobile-only Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 lg:hidden">
                <div className="flex justify-around items-center h-16">
                    {/* Categories Button */}
                    <button onClick={() => setSidebarOpen(true)} className={`flex flex-col items-center space-y-1 p-2 rounded-md ${sidebarOpen ? "text-red-600" : "text-gray-600"}`}>
                        <Menu className="w-6 h-6" />
                        <span className="text-xs font-medium">Categories</span>
                    </button>

                    {/* Home Button */}
                    <button onClick={() => navigate("/")} className={`flex flex-col items-center space-y-1 p-2 rounded-md ${location.pathname === "/" ? "text-red-600" : "text-gray-600"}`}>
                        <Home className="w-6 h-6" />
                        <span className="text-xs font-medium">Home</span>
                    </button>

                    {/* Profile Button */}
                    <button onClick={() => setIsMobileProfileOpen(true)} className={`flex flex-col items-center space-y-1 p-2 rounded-md ${isMobileProfileOpen ? "text-red-600" : "text-gray-600"}`}>
                        <User className="w-6 h-6" />
                        <span className="text-xs font-medium">Profile</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default SideBar;