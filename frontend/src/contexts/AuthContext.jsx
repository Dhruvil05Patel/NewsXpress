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
async function syncUserFCM(profileId, selectedCategories = [], retries = 3) {
	try {
		console.log("🔔 Starting FCM sync for profile:", profileId);
		
		const token = await getFCMToken();
		if (!token) {
			console.warn("⚠️ No FCM token available. User may have denied permissions.");
			return;
		}

		// Avoid duplicate sending
		const cacheKey = `fcm_token_${profileId}`;
		if (localStorage.getItem(cacheKey) === token) {
			console.log("✅ FCM token already synced (cached)");
			return;
		}

		// Always send lowercase categories and only the intended fields
		const lcCategories = Array.isArray(selectedCategories)
			? selectedCategories.map((c) => (typeof c === "string" ? c.toLowerCase() : c))
			: [];
		
		console.log("📤 Sending to backend:", { 
			fcm_token: token.substring(0, 20) + "...", 
			categories: lcCategories 
		});
		
		await updateProfile(profileId, {
			fcm_token: token,
			categories: lcCategories,
		});

		localStorage.setItem(cacheKey, token);
		console.log("✅ FCM Token successfully updated for profile:", profileId);
	} catch (e) {
		console.error("❌ FCM sync failed:", e?.message || e);
		
		// Retry logic
		if (retries > 0) {
			console.log(`🔄 Retrying FCM sync... (${retries} attempts left)`);
			await new Promise(resolve => setTimeout(resolve, 2000));
			return syncUserFCM(profileId, selectedCategories, retries - 1);
		}
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

				// Add delay to ensure auth is stable and page is loaded before FCM sync
				setTimeout(() => {
					syncUserFCM(backendProfile.id, categories);
				}, 1500);
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
