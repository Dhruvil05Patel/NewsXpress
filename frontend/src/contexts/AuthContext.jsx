import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { initAuthListener } from "../components/auth/controller/authController";
import { getFCMToken } from "../utils/getFCMToken";
import { updateProfile, getProfile } from "../services/api";

const AuthContext = createContext({ 
	user: null, 
	profile: null, 
	loading: true,
	refreshProfile: () => {}
});

/**
 * Sync FCM Token + Categories
 */
async function syncUserFCM(profileId, selectedCategories = []) {
	try {
		const token = await getFCMToken();
		if (!token) return;

		// Avoid duplicate sending
		const cacheKey = `fcm_token_${profileId}`;
		if (localStorage.getItem(cacheKey) === token) return;

		// Always send lowercase categories and only the intended fields
		const lcCategories = Array.isArray(selectedCategories)
			? selectedCategories.map((c) => (typeof c === "string" ? c.toLowerCase() : c))
			: [];
		await updateProfile(profileId, {
			fcm_token: token,
			categories: lcCategories,
		});

		localStorage.setItem(cacheKey, token);
		console.log("🔔 FCM Token updated for profile:", profileId);
	} catch (e) {
		console.warn("⚠️ FCM sync failed:", e?.message || e);
	}
}

export function AuthProvider({ children }) {
	const [profile, setProfile] = useState(null);
	const [firebaseUser, setFirebaseUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Function to manually refresh profile from backend
	const refreshProfile = useCallback(async () => {
		if (!profile?.id) return;
		
		try {
			console.log("🔄 Refreshing profile from backend...");
			const updatedProfile = await getProfile(profile.id);
			setProfile(updatedProfile);
			console.log("✅ Profile refreshed:", updatedProfile);
		} catch (error) {
			console.error("❌ Failed to refresh profile:", error);
		}
	}, [profile?.id]);

	useEffect(() => {
		const unsubscribe = initAuthListener(async (backendProfile, user) => {
			setFirebaseUser(user);
			setProfile(backendProfile);
			setLoading(false);

			// Must sync using backendProfile.categories (not topic!)
			if (backendProfile?.id && user?.emailVerified) {
				const categories = Array.isArray(backendProfile.categories)
					? backendProfile.categories
					: [];

				// Add small delay to ensure auth is stable before FCM sync
				setTimeout(() => {
					syncUserFCM(backendProfile.id, categories);
				}, 500);
			}
		});

		return () => unsubscribe && unsubscribe();
	}, []);

	// Listen for profile-updated events and refresh profile
	useEffect(() => {
		const handleProfileUpdated = () => {
			console.log("📢 profile-updated event received");
			refreshProfile();
		};

		window.addEventListener("profile-updated", handleProfileUpdated);
		return () => window.removeEventListener("profile-updated", handleProfileUpdated);
	}, [refreshProfile]);

	const value = useMemo(
		() => ({ user: firebaseUser, profile, loading, refreshProfile }),
		[firebaseUser, profile, loading, refreshProfile]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	return useContext(AuthContext);
}
