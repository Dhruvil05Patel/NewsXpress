// Profile.jsx
// Right-side account/settings panel (mobile overlay + desktop slide-in).
// Props: isOpen(boolean), onClose(callback), userProfile(object|null), onLoginClick(trigger).
import React, { useState, useEffect, useRef } from "react";
import { X, Bookmark, TrendingUp, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    updateProfile as apiUpdateProfile,
    checkUsernameAvailability,
} from "../services/api";
import notify from "../utils/toast";
import { logoutUser } from "./auth/controller/authController";

// Profile side panel (mobile overlay + desktop slide-in)
// Controlled by parent via isOpen/onClose
export default function Profile({
    isOpen, // visible state
    onClose, // close handler
    userProfile, // profile data (guest = null)
    onLoginClick, // open login modal
}) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [showSettingsPanel, setShowSettingsPanel] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [editingUsername, setEditingUsername] = useState(false);
    const [newName, setNewName] = useState(userProfile?.full_name || "");
    const [newUsername, setNewUsername] = useState(userProfile?.username || "");
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState(null);

    useEffect(() => {
        setNewName(userProfile?.full_name || "");
        setNewUsername(userProfile?.username || "");
    }, [userProfile?.full_name, userProfile?.username]);

    // Delete account handler
    // Simulated delete account (demo only)
    const handleDeleteAccount = () => {
        if (!userProfile?.id) {
            notify.error("Login required before deleting account");
            return;
        }
        notify.warn("Deleting account...");
        // Simulate async delete
        setTimeout(() => {
            notify.success("Account deleted");
            window.dispatchEvent(new Event("account-deleted"));
        }, 500);
    };

    // Log to console whenever account-deleted event fires (demo listener)
    useEffect(() => {
        const handler = () => console.log("Account Deleted");
        window.addEventListener("account-deleted", handler);
        return () => window.removeEventListener("account-deleted", handler);
    }, []);
    // Save full name change
    const handleSaveName = async () => {
        if (!userProfile?.id)
            return notify.error("No profile found. Please login.");
        setSaving(true);
        try {
            await apiUpdateProfile(userProfile.id, { full_name: newName });
            notify.success("Full name updated");
            window.dispatchEvent(new Event("profile-updated"));
            setEditingName(false);
        } catch (err) {
            notify.error("Failed to save full name");
        } finally {
            setSaving(false);
        }
    };

    // Save username after availability validation
    const handleSaveUsername = async () => {
        if (!userProfile?.id)
            return notify.error("No profile found. Please login.");
        if (!usernameAvailable) return notify.error("Username already taken");
        if (!newUsername.trim()) return notify.error("Username cannot be empty");
        setSaving(true);
        try {
            await apiUpdateProfile(userProfile.id, { username: newUsername.trim() });
            notify.success("Username updated successfully");
            window.dispatchEvent(new Event("profile-updated"));
            setEditingUsername(false);
        } catch (err) {
            notify.error("Failed to save username");
        } finally {
            setSaving(false);
        }
    };

    // Debounced username availability check
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
                setUsernameAvailable(false);
            } finally {
                setCheckingUsername(false);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [newUsername, editingUsername, userProfile?.username, userProfile?.id]);

    const handleHelpClick = () => {
        navigate("/help");
        onClose();
    };

    // Toggle notifications (UI-only demo)
    const handleNotificationToggle = () => {
        setNotifications((prev) => {
            const next = !prev;
            notify.info(
                next ? "🔔 Notifications enabled" : "🔕 Notifications disabled"
            );
            return next;
        });
    };

    const gradientStyle = {
        background:
            "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 35%,#ff0066 75%,#ff1e1e 100%)",
        boxShadow:
            "0 4px 12px -2px rgba(255,0,80,0.35), 0 2px 5px -1px rgba(0,0,0,0.25)",
        color: "#fff",
    };

    const PanelContent = () => (
        <div className="p-6 space-y-6 bg-white h-full">
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
                        <p className="text-xs text-gray-600">{userProfile?.email || ""}</p>
                        <p className="text-xs text-gray-600">
                            @{userProfile?.username || "unknown"}
                        </p>
                    </div>
                </div>
            </div>
            {userProfile && (
                <div className="space-y-2">
                    <button
                        onClick={() => {
                            navigate("/bookmarks");
                            onClose && onClose();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all duration-200"
                    >
                        <Bookmark className="w-5 h-5 text-gray-500" />
                        <span>Bookmarks</span>
                    </button>
                    <button
                        onClick={() => {
                            navigate("/feed/personalized");
                            onClose && onClose();
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all duration-200"
                    >
                        <TrendingUp className="w-5 h-5 text-gray-500" />
                        <span>Personalized Feed</span>
                    </button>
                </div>
            )}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-gray-900">
                        Profile Settings
                    </h4>
                    <button
                        onClick={() => {
                            if (!userProfile) return onLoginClick && onLoginClick();
                            setShowSettingsPanel((s) => !s);
                        }}
                        className="text-sm text-red-600 font-semibold"
                    >
                        {showSettingsPanel ? "Close" : "Open"}
                    </button>
                </div>
                {showSettingsPanel && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200 shadow-sm">
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
                                                    : newUsername && newUsername !== userProfile?.username
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
                                                className={`text-xs ${usernameAvailable ? "text-green-600" : "text-red-600"
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
                        <div>
                            <button
                                onClick={handleHelpClick}
                                className="w-full px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md border border-red-100 font-medium shadow-sm hover:bg-red-100 transition"
                            >
                                Help & Support
                            </button>
                        </div>
                        <div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-3">
                                    <Bell className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                        Notifications
                                    </span>
                                </div>
                                <button
                                    onClick={handleNotificationToggle}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifications ? "bg-red-500" : "bg-gray-200"
                                        }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifications ? "translate-x-5" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            </div>
                            {/* Delete Account Demo (placed below notifications) */}
                            <div className="pt-2">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full px-4 py-2 text-sm font-semibold rounded-md text-white shadow-sm transition-all"
                                    style={{
                                        background:
                                            "linear-gradient(135deg,#ff1e1e 0%,#ff4d4d 40%,#ff0066 85%)",
                                        boxShadow: "0 4px 12px -2px rgba(255,0,80,0.45)",
                                        letterSpacing: ".3px",
                                    }}
                                    aria-label="Delete account"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t">
                {!userProfile ? (
                    <button
                        onClick={() => {
                            onLoginClick && onLoginClick();
                            onClose();
                        }}
                        className="w-full text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                        style={gradientStyle}
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
    );

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`lg:hidden fixed inset-0 z-60 flex justify-end ${isOpen ? "pointer-events-auto" : "pointer-events-none"
                    }`}
            >
                <div
                    className={`fixed inset-0 transition-opacity duration-300 ease-in-out ${isOpen ? "bg-opacity-40" : "bg-opacity-0 pointer-events-none"
                        }`}
                    onClick={onClose}
                />
                <div
                    className={`relative w-[30rem] bg-white shadow-xl h-full flex flex-col z-70 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-base font-bold text-gray-900">
                            Profile & Settings
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="overflow-y-auto">
                        <PanelContent />
                    </div>
                </div>
            </div>
            {/* Desktop sidebar */}
            <aside
                className={`hidden xl:block fixed right-0 top-16 bottom-0 w-[30rem] bg-white border-l border-gray-200 overflow-y-auto z-70 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-base font-bold text-gray-900">
                        Profile & Settings
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        aria-label="Close profile sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    <PanelContent />
                </div>
            </aside>
        </>
    );
}
