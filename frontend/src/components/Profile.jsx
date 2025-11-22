import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, TrendingUp, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
    updateProfile as apiUpdateProfile,
    checkUsernameAvailability,
} from "../services/api";
import notify from "../utils/toast";

// ToggleSwitch: simple labeled toggle for profile settings
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

// ProfileActionButton: quick action button for profile overlay
const ProfileActionButton = ({ label, Icon, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all duration-200"
    >
        <Icon className="w-5 h-5 text-gray-500" />
        <span>{label}</span>
    </button>
);

// Profile overlay: user info, edit name/username, notification toggle
export default function Profile() {
    const navigate = useNavigate();
    const { profile: userProfile } = useAuth();

    // State: notification toggle, edit fields, username check
    const [notifications, setNotifications] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [editingUsername, setEditingUsername] = useState(false);
    const [newName, setNewName] = useState(userProfile?.full_name || "");
    const [newUsername, setNewUsername] = useState(userProfile?.username || "");
    const [usernameAvailable, setUsernameAvailable] = useState(true);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [saving, setSaving] = useState(false);

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
            await apiUpdateProfile(userProfile.id, payload);
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
            await apiUpdateProfile(userProfile.id, payload);
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
                console.error("Error checking username:", err);
                setUsernameAvailable(false);
            } finally {
                setCheckingUsername(false);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [newUsername, editingUsername, userProfile?.username, userProfile?.id]);

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                    Profile & Settings
                </h1>

                {/* Profile Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-4">
                        {userProfile?.avatar_url ? (
                            <img
                                src={userProfile.avatar_url}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover border-2 border-red-200"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                                {(userProfile?.full_name || "G").charAt(0).toUpperCase()}
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

                {/* Quick Actions */}
                {userProfile && (
                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        <ProfileActionButton
                            label="Bookmarks"
                            Icon={Bookmark}
                            onClick={() => navigate("/bookmarks")}
                        />
                        <ProfileActionButton
                            label="Personalized Feed"
                            Icon={TrendingUp}
                            onClick={() => navigate("/feed/personalized")}
                        />
                    </div>
                )}

                {/* Settings */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                    {/* Full Name */}
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

                    {/* Username */}
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

                    {/* Help & Support */}
                    <div>
                        <button
                            onClick={() => navigate("/help")}
                            className="w-full px-4 py-2 text-sm bg-red-50 text-red-600 rounded-md border border-red-100 font-medium shadow-sm hover:bg-red-100 transition"
                        >
                            Help & Support
                        </button>
                    </div>

                    {/* Notifications */}
                    <div>
                        <ToggleSwitch
                            enabled={notifications}
                            setEnabled={setNotifications}
                            label="Notifications"
                            Icon={Bell}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
