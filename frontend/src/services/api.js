// Import axios for HTTP requests
import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = 'http://localhost:4000';

// Create an axios instance with default config
const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // Send cookies if needed
	headers: {
		'Content-Type': 'application/json',
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

//Fetch summarized news articles from backend
export const getSummarizedNews = async () => {
	const response = await api.get('/get-summarized-news');
	return response.data;
};

// Export axios instance for custom requests
export default api;