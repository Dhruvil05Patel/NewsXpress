// Pipeline: fetch -> dedupe -> summarize -> save -> notify

const { connectDB } = require('../../config/db');
const { fetchNews } = require('../../FetchingNews');
const { summarizeNewsArticles } = require('../../Summarizing');
const { saveArticles, getArticlesByTopic } = require('../../services/ArticleService');
const { notifySubscribersForCategory } = require('../services/notifier');

const DEFAULT_SUMMARIZE_LIMIT = 8;

/**
 * Utility: remove articles that already exist in DB based on title or url.
 */
function filterNewArticles(articles, existingArticles) {
  const seen = new Set();
  for (const a of existingArticles || []) {
    if (a.title) seen.add(a.title.trim().toLowerCase());
    if (a.original_url) seen.add(a.original_url.trim().toLowerCase());
    if (a.newsUrl) seen.add(a.newsUrl.trim().toLowerCase());
  }

  return articles.filter(a => {
    const title = (a.title || '').trim().toLowerCase();
    const url = (a.link || '').trim().toLowerCase();
    if (seen.has(title) || (url && seen.has(url))) {
      return false;
    }
    // mark to avoid duplicates within current batch
    if (title) seen.add(title);
    if (url) seen.add(url);
    return true;
  });
}

/**
 * Summarize in small batches to avoid heavy concurrent work
 */
async function batchSummarize(articles, batchSize = 4) {
  const results = [];
  for (let i = 0; i < articles.length; i += batchSize) {
    const chunk = articles.slice(i, i + batchSize);
    const out = await summarizeNewsArticles(chunk);
    results.push(...out);
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

/**
 * Main: fetch + dedupe + summarize + save + notify
 */
async function fetchAndSaveNews(category = 'all', newsCount = 15, summarizeLimit = DEFAULT_SUMMARIZE_LIMIT) {
  try {
    console.log(`Starting pipeline for category="${category}" (fetch ${newsCount}, summarize ${summarizeLimit})`);

    // Ensure DB connection
    await connectDB();

    // 1) Fetch from API
    const news = await fetchNews(category, newsCount);
    if (!news || news.length === 0) {
      console.log('No news returned from fetch step.');
      return { success: false, reason: 'no-news' };
    }

    // 2) Filter out items that lack title/url
    const valid = news.filter(a => a.title && a.link);
    if (!valid.length) {
      console.log('No valid (title+link) articles.');
      return { success: false, reason: 'no-valid-articles' };
    }

    // 3) Load recent articles from DB for this category to dedupe
    let recent = [];
    try {
      recent = await getArticlesByTopic(category, 100);
    } catch (err) {
      console.warn('Warning: failed to load recent articles for dedupe. Proceeding without dedupe.', err.message);
    }

    const newCandidates = filterNewArticles(valid, recent);
    if (newCandidates.length === 0) {
      console.log('No new articles after dedupe. Exiting.');
      return { success: true, saved: 0, reason: 'no-new-articles' };
    }

    // 4) Limit to summarizeLimit
    const toSummarize = newCandidates.slice(0, summarizeLimit);
    console.log(`Candidates to summarize: ${toSummarize.length}`);

    // 5) Summarize in small batches
    const summarized = await batchSummarize(toSummarize, 4);
    console.log(`Summarized: ${summarized.length}`);

    if (!summarized || summarized.length === 0) {
      console.log('Nothing summarized. Exiting.');
      return { success: false, reason: 'no-summarized-output' };
    }

    // 6) Save to DB
    const saveResult = await saveArticles(summarized);
    console.log(`Saved ${saveResult.count} articles, errors ${saveResult.errors.length}`);

    // 7) Notify subscribers for each saved article (background)
    (async () => {
      try {
        if (saveResult.inserted && Array.isArray(saveResult.inserted)) {
          for (const savedArticle of saveResult.inserted) {
            try {
              await notifySubscribersForCategory(category, savedArticle);
              await new Promise(r => setTimeout(r, 250));
            } catch (err) {
              console.warn('Notification error for article:', err.message);
            }
          }
        } else if (saveResult.count > 0) {
          for (const s of summarized) {
            try {
              await notifySubscribersForCategory(category, s);
              await new Promise(r => setTimeout(r, 250));
            } catch (err) {
              console.warn('Notification error for article:', err.message);
            }
          }
        }
      } catch (err) {
        console.error('Background notification loop failed:', err.message);
      }
    })();

    return {
      success: true,
      fetched: news.length,
      candidates: valid.length,
      toSummarize: toSummarize.length,
      summarized: summarized.length,
      savedCount: saveResult.count || 0,
      errors: saveResult.errors || [],
    };

  } catch (error) {
    console.error('fetchAndSaveNews pipeline error:', error.stack || error.message);
    return { success: false, error: error.message || String(error) };
  }
}

/**
 * Helper: run multiple categories sequentially but with a small delay
 */
async function fetchAndSaveMultipleCategories(categories = ['all'], newsCount = 12, summarizeLimit = DEFAULT_SUMMARIZE_LIMIT) {
  const results = [];
  for (const category of categories) {
    const res = await fetchAndSaveNews(category, newsCount, summarizeLimit);
    results.push({ category, result: res });
    await new Promise(r => setTimeout(r, 2000));
  }
  return results;
}

module.exports = {
  fetchAndSaveNews,
  fetchAndSaveMultipleCategories,
};
