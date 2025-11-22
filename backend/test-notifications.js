#!/usr/bin/env node

/**
 * Manual Test Script for Push Notifications
 * 
 * This script:
 * 1. Checks which users have FCM tokens
 * 2. Manually triggers a news fetch for a specific category
 * 3. Sends test notifications
 * 
 * Usage: node test-notifications.js <category>
 * Example: node test-notifications.js technology
 */

const { connectDB } = require('./config/db');
const { fetchAndSaveNews } = require('./src/cron/fetchAndSaveNews');
const { notifySubscribersForCategory } = require('./src/services/notifier');

async function checkTokens() {
  const db = require('./config/db');
  await connectDB();
  
  console.log('\n📊 Checking FCM Token Status\n' + '='.repeat(50));
  
  const profiles = await db.Profile.findAll({
    attributes: ['id', 'email', 'categories', 'fcm_token'],
    where: {
      fcm_token: { [db.Sequelize.Op.ne]: null }
    }
  });
  
  console.log(`\nTotal profiles with FCM tokens: ${profiles.length}\n`);
  
  for (const profile of profiles) {
    console.log(`👤 ${profile.email}`);
    console.log(`   ID: ${profile.id}`);
    console.log(`   Categories: ${JSON.stringify(profile.categories)}`);
    console.log(`   Token: ${profile.fcm_token.substring(0, 30)}...`);
    console.log('');
  }
  
  const allProfiles = await db.Profile.findAll({
    attributes: ['id', 'email', 'categories', 'fcm_token']
  });
  
  const withoutTokens = allProfiles.filter(p => !p.fcm_token);
  console.log(`⚠️  Profiles WITHOUT tokens: ${withoutTokens.length}`);
  if (withoutTokens.length > 0 && withoutTokens.length < 10) {
    withoutTokens.forEach(p => {
      console.log(`   - ${p.email}: categories=${JSON.stringify(p.categories)}`);
    });
  }
  
  return profiles.length;
}

async function testNotification(category = 'technology') {
  await connectDB();
  
  console.log('\n\n🧪 Testing Notification System\n' + '='.repeat(50));
  console.log(`Category: ${category}\n`);
  
  // Check tokens first
  const tokenCount = await checkTokens();
  
  if (tokenCount === 0) {
    console.log('\n❌ No FCM tokens found! Users need to:');
    console.log('   1. Log in to the app');
    console.log('   2. Allow notification permissions');
    console.log('   3. Select categories in the onboarding');
    console.log('\nExiting...');
    process.exit(1);
  }
  
  console.log('\n📰 Fetching and saving news...\n');
  
  // Fetch news for the category
  const result = await fetchAndSaveNews(category, 15, 3);
  
  console.log('\n📊 Fetch Result:', JSON.stringify(result, null, 2));
  
  if (result.success && result.savedCount > 0) {
    console.log('\n✅ News fetched and saved successfully!');
    console.log('   Notifications should have been sent automatically.');
  } else {
    console.log('\n⚠️  No new articles were saved (might be duplicates)');
    console.log('   Sending a manual test notification...\n');
    
    // Send a manual test notification
    const testArticle = {
      title: 'Test Notification - Please Ignore',
      summary: 'This is a test notification to verify the push notification system is working correctly.',
      newsUrl: 'http://localhost:5174/',
      category: category,
    };
    
    const notifResult = await notifySubscribersForCategory(category, testArticle);
    console.log('   Result:', notifResult);
  }
  
  console.log('\n✅ Test complete!\n');
  process.exit(0);
}

// Main
const category = process.argv[2] || 'technology';
testNotification(category).catch(err => {
  console.error('\n❌ Test failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
