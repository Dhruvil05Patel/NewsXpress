// Import axios for HTTP requests
import axios from "axios";
// Vite exposes env vars via `import.meta.env`. Do not use dotenv in browser code.
const VITE_BACKEND_API_URL =
	import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4000";
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
export const syncUser = async (idToken, username = null) => {
	const payload = { idToken };
	if (username) payload.username = username;
	const response = await api.post("/api/auth/sync", payload);
	return response.data;
};

//Fetch summarized news articles from backend
export const getSummarizedNews = async () => {
	const response = await api.get("/get-summarized-news");
	return response.data;
};

// Export axios instance for custom requests
export default api;
