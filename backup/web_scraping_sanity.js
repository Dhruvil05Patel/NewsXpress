import puppeteer from 'puppeteer';
import { createClient } from '@sanity/client';

// -----  GROQ Setup  with (Sanity.io) -----
const sanityClient = createClient({
  projectId: 'q6bs4rt7', //Sanity project ID
  dataset: 'production',
  useCdn: true,              
  apiVersion: '2025-09-11'   
});

async function fetchFromSanity() {
  try {
    const query = `*[_type == "post"]{
      title,
      description,
      publishedAt,
      "url": url // If your posts store article links in Sanity
    } | order(publishedAt desc)`;

    const articles = await sanityClient.fetch(query);

    if (articles.length) {
      console.log('---Articles from Sanity---');
      console.log(articles);
      return articles;
    }

    return null;
  } catch (err) {
    console.error('Sanity fetch error:', err);
    return null;
  }
}

// -----  Puppeteer Setup -----
async function fetchFromWebsite(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
    );

    await page.goto(url, { waitUntil: 'networkidle2' });

    // thoda time ma article aavse 
    await page.waitForSelector('article, section, div', { timeout: 60000 });

    const articles = await page.evaluate(() => {
      const nodes = document.querySelectorAll('article, section, div');
      return Array.from(nodes)
        .map(node => {
          const title = node.querySelector('h1, h2, h3')?.innerText.trim();
          const description = node.querySelector('p')?.innerText.trim();

          // je article <a> ma hoi tene fetch karva mate
          let link = node.querySelector('a')?.href;
          if (link && !link.startsWith('http')) {
            // relative URLs
            link = new URL(link, window.location.origin).href;
          }

          return title && description ? { title, description, url: link || null } : null;
        })
        .filter(Boolean);
    });

    await browser.close();

    if (articles.length) {
      console.log('---Articles from Website (Automatic Detection)---');
      console.log(articles);
      return articles;
    }

    return null;
  } catch (err) {
    console.error('Website fetch error:', err.message);
    return null;
  }
}

// ----- Remove duplicates -----
function removeDuplicates(articles) {
  const seen = new Set();
  return articles.filter(article => {
    const key = article.url || article.title; // Use URL if available else TITLE
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ----- Hybrid Fetch -----
async function fetchNews() {
  // Try GROQ first
  let articles = await fetchFromSanity();
  if (articles && articles.length) {
    return removeDuplicates(articles);
  }

  // Fallback to Puppeteer with automatic detection
  const url = 'https://www.bbc.com/news'; // Any news site can be used...
  articles = await fetchFromWebsite(url);
  return articles ? removeDuplicates(articles) : [];
}

// Run the hybrid fetch
fetchNews().then((articles) => {
  if (!articles || !articles.length) {
    console.log('No articles found from either source.');
  } else {
    console.log('---Final Unique Articles---');
    console.log(articles);
  }
});
