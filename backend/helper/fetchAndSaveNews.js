/**
 * Helper Script: Fetch, Summarize, and Save News to Database
 * 
 * This script can be run manually or scheduled as a cron job
 * to fetch fresh news and save it to the Supabase database.
 */

const { connectDB } = require('../config/db');
const { fetchNews } = require('../FetchingNews');
const { summarizeNewsArticles } = require('../Summarizing');
const { saveArticles } = require('../services/ArticleService');

/**
 * Main function to fetch and save news
 */
async function fetchAndSaveNews(category = 'all', newsCount = 15, articlesToSummarize = 8) {
  try {
    console.log('\n Starting news fetching and saving process...');
    console.log(`Category: ${category}`);
    console.log(`News count: ${newsCount}`);
    
    // Step 1: Connect to database
    console.log('\n Step 1: Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    // Step 2: Fetch news articles
    console.log(`\n Step 2: Fetching ${category} news from API...`);
    const newsArticles = await fetchNews(category, newsCount);
    console.log(`Fetched ${newsArticles.length} articles`);

    if (newsArticles.length === 0) {
      console.log('No articles found. Exiting...');
      return { success: false, message: 'No articles found' };
    }

    // Step 3: Filter articles with content
    const articlesWithContent = newsArticles.filter(a => a.title && a.link);
    console.log(`Filtered to ${articlesWithContent.length} articles with title and link`);

    if (articlesWithContent.length === 0) {
      console.log('No valid articles to process. Exiting...');
      return { success: false, message: 'No valid articles' };
    }

    // Step 4: Summarize articles using AI
    console.log(`\n🤖 Step 3: Summarizing ${Math.min(articlesToSummarize, articlesWithContent.length)} articles with AI...`);
    const summarizedNews = await summarizeNewsArticles(articlesWithContent.slice(0, articlesToSummarize));
    console.log(` Successfully summarized ${summarizedNews.length} articles`);

    // Step 5: Save to database
    console.log(`\n Step 4: Saving articles to database...`);
    const result = await saveArticles(summarizedNews);

    // Step 6: Display results
    console.log('\n' + '='.repeat(50));
    console.log(' SUMMARY OF OPERATION');
    console.log('='.repeat(50));
    console.log(`Category:           ${category}`);
    console.log(`Fetched:            ${newsArticles.length} articles`);
    console.log(`Processed:          ${articlesWithContent.length} articles`);
    console.log(`Summarized:         ${summarizedNews.length} articles`);
    console.log(`Saved to DB:        ${result.count} articles`);
    console.log(`Failed:             ${result.errors.length} articles`);
    console.log('='.repeat(50));

    if (result.errors.length > 0) {
      console.log('\n Failed articles:');
      result.errors.forEach(err => console.log(`  - ${err.article}: ${err.error}`));
    }

    return {
      success: true,
      category,
      fetched: newsArticles.length,
      processed: articlesWithContent.length,
      summarized: summarizedNews.length,
      saved: result.count,
      failed: result.errors.length,
      errors: result.errors,
    };

  } catch (error) {
    console.error('\n Fatal error in fetchAndSaveNews:', error.message);
    console.error('Stack trace:', error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Fetch and save news for multiple categories
 */
async function fetchAndSaveMultipleCategories(categories = ['all'], newsCount = 15, articlesToSummarize = 8) {
  const results = [];

  for (const category of categories) {
    console.log(`\n${'*'.repeat(60)}`);
    console.log(`Processing category: ${category.toUpperCase()}`);
    console.log('*'.repeat(60));

    const result = await fetchAndSaveNews(category, newsCount, articlesToSummarize);
    results.push(result);

    // Add delay between categories to avoid rate limiting
    if (categories.indexOf(category) < categories.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  return results;
}

// Export functions
module.exports = {
  fetchAndSaveNews,
  fetchAndSaveMultipleCategories,
};

// If run directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  const category = args[0] || 'all';
  const newsCount = parseInt(args[1]) || 15;
  const articlesToSummarize = parseInt(args[2]) || 8;

  console.log(' Running');
  console.log(`Arguments: category=${category}, newsCount=${newsCount}, articlesToSummarize=${articlesToSummarize}`);

  fetchAndSaveNews(category, newsCount, articlesToSummarize)
    .then(result => {
      if (result.success) {
        console.log('\n Script completed successfully!');
        process.exit(0);
      } else {
        console.log('\n Script completed with warnings.');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('\n Script failed:', error);
      process.exit(1);
    });
}
