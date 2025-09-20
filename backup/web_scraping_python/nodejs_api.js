const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { log } = require('console');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '1VCTuSJv0ogBl434dO_Ww2TAhULY4ZhCa4y_D7lNBIXQ';
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_PATH || '/path/to/credential.json';

class NewsAPI {
    constructor() {
        this.doc = null;
        this.sheet = null;
        this.setupGoogleSheets();
    }

    async setupGoogleSheets() {
        try {
            // Read credentials
            const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH, 'utf8'));
            
            // Initialize auth
            const serviceAccountAuth = new JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive'
                ],
            });

            // Initialize the sheet
            this.doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
            await this.doc.loadInfo();
            
            this.sheet = this.doc.sheetsByTitle['News Articles'];
            console.log('Connected to Google Sheets');
            
        } catch (error) {
            console.log('Google Sheets connection failed');
            console.log('Error:', error.message);
        }
    }

    async getArticlesFromSheets() {
        try {
            if (!this.sheet) {
                throw new Error('Google Sheets not connected');
            }

            const rows = await this.sheet.getRows();
            
            const articles = rows.map((row, index) => ({
                id: row.get('id') || index + 1,
                source: row.get('source') || '',
                title: row.get('title') || '',
                summary: row.get('summary') || '',
                url: row.get('url') || '',
                publishDate: row.get('publishDate') || '',
                authors: row.get('authors') ? row.get('authors').split(', ') : [],
                uploadTime: row.get('uploadTime') || '',
                topImage: row.get('topImage') || '',
                contentLength: parseInt(row.get('contentLength')) || 0
            }));
            articles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
            return articles;
        } catch (error) {
            console.error('Error fetching from sheets:', error);
            throw error;
        }
    }

    

    async getArticles(source = 'auto') {
        try {
            let articles = [];
            if (source === 'sheets' || (source === 'auto' && this.sheet)) {
                articles = await this.getArticlesFromSheets();
                } else {
                    articles = await this.getArticlesFromLocal();
                }
            return articles;
        } catch (error) {
            throw error;
        }
    }

}

// Initialize the API
(async () => {
    const newsAPI = new NewsAPI();
    await newsAPI.setupGoogleSheets();  // Wait for sheets to be ready

    try {
        const articles = await newsAPI.getArticles('auto'); // 'auto' -> sheets if available, else local
        console.log('Articles fetched:', articles.length);
        console.log(articles);
    } catch (error) {
        console.error('Failed to fetch articles:', error.message);
    }
})();
// Routes