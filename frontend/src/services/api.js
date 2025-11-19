import axios from "axios";
// Vite exposes env vars via `import.meta.env`. Do not use dotenv in browser code.
const VITE_BACKEND_API_URL =
	import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4000";

// ML API URL (separate service, typically on port 5001)
const VITE_ML_API_URL =
	import.meta.env.VITE_ML_API_URL || "http://localhost:5001";

// Base URL for backend API
const API_BASE_URL = VITE_BACKEND_API_URL;

// Create an axios instance with default config
const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // Send cookies if needed
	headers: {
		"Content-Type": "application/json",
	},
});

// Create axios instance for ML API
const mlApi = axios.create({
	baseURL: VITE_ML_API_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

//Generic GET request to backend
export const fetchData = async (endpoint) => {
	const response = await api.get(endpoint);
	return response.data;
};

// Generic POST request to backend
export const postData = async (endpoint, data) => {
	const response = await api.post(endpoint, data);
	return response.data;
};

// Sync Firebase-authenticated user to backend (verifies token server-side and creates/returns profile)
// Sync Firebase-authenticated user to backend (verifies token server-side and creates/returns profile)
// Accepts optional username (e.g., a user-chosen username from signup) and forwards it to backend.
export const syncUser = async (idToken, profileData = null) => {
	// `profileData` may be null (legacy), a username string, or an object
	// containing fields like: { username, full_name, email, fcm_token, categories }
	const payload = { idToken };

	if (profileData) {
		if (typeof profileData === 'string') {
			// legacy behavior: profileData was a username string
			payload.username = profileData;
		} else if (typeof profileData === 'object') {
			// merge provided profile fields into the payload
			Object.assign(payload, profileData);
		}
	}

	const { data } = await api.post('/api/auth/sync', payload);
	// Always return the backend profile object (Sequelize/UUID) or null
	return data && data.profile ? data.profile : null;
};

//Fetch summarized news articles from backend
export const getSummarizedNews = async () => {
	const response = await api.get("/get-summarized-news");
	return response.data;
};

// Profile helpers (match backend Profile schema)
export const getProfile = async (profileId) => {
  const { data } = await api.get(`/api/profiles/${profileId}`);
  return data; // Sequelize model JSON with fields: id, full_name, username, avatar_url, actor, place, topic, categories, fcm_token
};

export const updateProfile = async (profileId, updateData) => {
  // Allowed keys include: full_name, username, avatar_url, actor, place, topic,
  // categories (array of strings), fcm_token (string)
  const { data } = await api.put(`/api/profiles/${profileId}`, updateData);
  return data;
};

// Check if username is available
export const checkUsernameAvailability = async (username, excludeProfileId = null) => {
  const params = excludeProfileId ? { excludeId: excludeProfileId } : {};
  const { data } = await api.get(`/api/profiles/check-username/${username}`, { params });
  return data; // { available: boolean, username: string }
};

// Get bookmarks for a profile
export const getBookmarksForProfile = async (profileId) => {
	const { data } = await api.get(`/api/profiles/${profileId}/bookmarks`);
	// server returns { bookmarks: [...] }
	return data.bookmarks || [];
};

// Add a bookmark (or update note)
export const addBookmark = async (profileId, articleId, note = null, articleData = null) => {
	const payload = { article_id: articleId, note };
	if (articleData) payload.articleData = articleData; // optional article metadata
	const { data } = await api.post(`/api/profiles/${profileId}/bookmarks`, payload);
	return data;
};

// Remove bookmark
export const removeBookmarkApi = async (profileId, articleId) => {
	const { data } = await api.delete(`/api/profiles/${profileId}/bookmarks/${articleId}`);
	return data;
};

export const sendVerificationEmail = async (email, name) => {
	const { data } = await api.post('/api/auth/send-verification', { email, name });
	return data;
};

export const sendResetPasswordEmail = async (email, name, resetUrl) => {
	const response = await api.post("/api/auth/send-password-reset-email", {
		email,
		name,
	});
	return response.data;
};

// =====================================================
// ML RECOMMENDATIONS API HELPERS
// =====================================================

export const getRecommendations = async ({
	method = 'hybrid',
	userId = null,
	articleId = null,
	topN = 10,
	exclude = [],
	recentArticles = []
} = {}) => {
	try {
		const response = await mlApi.post('/api/recommendations', {
			method,
			user_id: userId,
			article_id: articleId,
			top_n: topN,
			exclude,
			recent_articles: recentArticles
		});
		return response.data;
	} catch (error) {
		console.error('Error fetching recommendations:', error);
		return {
			success: false,
			recommendations: [],
			error: error.message
		};
	}
};

export const trackInteraction = async ({
	userId = null,
	articleId,
	activityType,
	source = 'direct',
	recommendationType = null,
	durationSeconds = null,
	scrollPercentage = null,
	metadata = {}
} = {}) => {
	try {
		const response = await mlApi.post('/api/track', {
			user_id: userId,
			article_id: articleId,
			activity_type: activityType,
			source,
			recommendation_type: recommendationType,
			duration_seconds: durationSeconds,
			scroll_percentage: scrollPercentage,
			metadata,
			timestamp: new Date().toISOString()
		});
		return response.data;
	} catch (error) {
		console.warn('Activity tracking failed:', error);
		return {
			success: false,
			error: error.message
		};
	}
};

// Export axios instance for custom requests
export default api;
