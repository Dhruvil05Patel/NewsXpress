/**
 * User Interaction Service
 * Handles all database operations for user interactions,
 * including the new bookmarking logic.
 */

// Importing only the models this service needs from the central db config
const { UserInteraction, Article, Source } = require('../config/db');
const { Sequelize } = require('sequelize'); // For Op.is

/**
 * Creates or updates an interaction to add a bookmark.
 * If the user has already interacted with this article, it updates the row.
 * If not, it creates a new one.
 *
 * @param {string} profileId - The profile ID of the user.
 * @param {string} articleId - The article ID to bookmark.
 * @param {string} [note] - An optional note for the bookmark.
 * @returns {Promise<object>} The created or updated interaction.
 */
async function addBookmark(profileId, articleId, note = null) {
  try {
    // Check if an interaction for this pair already exists
    const [interaction, created] = await UserInteraction.findOrCreate({
      where: {
        profile_id: profileId,
        article_id: articleId,
      },
      defaults: {
        // These are set if a new row is created
        profile_id: profileId,
        article_id: articleId,
        bookmark_timestamp: new Date(), // Set the bookmark time
        note: note,
        interaction_at: new Date(), // Set the first interaction time
      },
    });

    if (!created) {
      // The interaction row already existed, so just update it
      interaction.bookmark_timestamp = new Date();
      if (note) {
        interaction.note = note;
      }
      await interaction.save();
      console.log(`✅ Bookmark updated for article: ${articleId}`);
    } else {
      console.log(`✅ Bookmark created for article: ${articleId}`);
    }

    return interaction;

  } catch (error) {
    console.error('Error in addBookmark:', error.message);
    throw new Error('Could not add bookmark.');
  }
}

/**
 * Removes a bookmark from an interaction.
 * This sets the bookmark_timestamp and note to null.
 *
 * @param {string} profileId - The profile ID of the user.
 * @param {string} articleId - The article ID to unbookmark.
 * @returns {Promise<object|null>} The updated interaction or null.
 */
async function removeBookmark(profileId, articleId) {
  try {
    // Find the specific interaction
    const interaction = await UserInteraction.findOne({
      where: {
        profile_id: profileId,
        article_id: articleId,
      },
    });

    if (interaction) {
      // "Remove" the bookmark by nullifying its fields
      interaction.bookmark_timestamp = null;
      interaction.note = null;
      await interaction.save();
      
      console.log(`✅ Bookmark removed for article: ${articleId}`);
      return interaction;
    }

    console.log(`⚠️ No bookmark found to remove for article: ${articleId}`);
    return null; // No bookmark was found to remove

  } catch (error) {
    console.error('Error in removeBookmark:', error.message);
    throw new Error('Could not remove bookmark.');
  }
}

/**
 * Gets all of a user's bookmarked articles.
 *
 * @param {string} profileId - The profile ID of the user.
 * @returns {Promise<Array<object>>} An array of user_interaction objects
 */
async function getBookmarksByProfile(profileId) {
  try {
    const bookmarks = await UserInteraction.findAll({
      where: {
        profile_id: profileId,
        // Find all interactions where bookmark_timestamp is not null
        bookmark_timestamp: {
          [Sequelize.Op.not]: null,
        },
      },
      // Include the associated Article data for each bookmark
      include: [
        {
          model: Article,
          as: 'article', // Make sure this alias matches your model's association
          include: [
            {
              model: Source,
              as: 'source', // Make sure this alias matches
              attributes: ['name'],
            },
          ],
        },
      ],
      order: [['bookmark_timestamp', 'DESC']],
    });

    return bookmarks;

  } catch (error) {
    console.error('Error in getBookmarksByProfile:', error.message);
    throw new Error('Could not retrieve bookmarks.');
  }
}

module.exports = {
  addBookmark,
  removeBookmark,
  getBookmarksByProfile,
};