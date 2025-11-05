/**
 * Profile Service
 * Handles all database operations for user profiles.
 */

// Importing only the models this service needs from the central db config
const { Profile } = require('../config/db'); 

/**
 * Get a single user profile by their ID.
 * @param {string} profileId - The UUID of the profile to retrieve.
 * @returns {Promise<object|null>} The Sequelize profile object or null.
 */
async function getProfileById(profileId) {
  try {
    const profile = await Profile.findByPk(profileId);
    return profile;
  } catch (error) {
    console.error('Error in getProfileById:', error.message);
    throw new Error('Could not retrieve profile.');
  }
}

/**
 * Update a user's profile preferences and info.
 * @param {string} profileId - The UUID of the profile to update.
 * @param {object} updateData - An object containing { actor, place, topic, fullName, username, avatarUrl }
 * @returns {Promise<object>} The updated profile.
 */
async function updateProfile(profileId, updateData) {
  try {
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      throw new Error('Profile not found.');
    }

    // Update fields only if they are provided
    if (updateData.full_name !== undefined) {
      profile.full_name = updateData.full_name;
    }
    if (updateData.username !== undefined) {
      profile.username = updateData.username;
    }
    if (updateData.avatar_url !== undefined) {
      profile.avatar_url = updateData.avatar_url;
    }
    
    // Update the NEW preference fields
    if (updateData.actor !== undefined) {
      profile.actor = updateData.actor;
    }
    if (updateData.place !== undefined) {
      profile.place = updateData.place;
    }
    if (updateData.topic !== undefined) {
      profile.topic = updateData.topic;
    }

    // Save the changes back to the database
    await profile.save();
    
    console.log(`✅ Profile updated for ID: ${profileId}`);
    return profile;

  } catch (error) {
    console.error('Error in updateProfile:', error.message);
    throw new Error('Could not update profile.');
  }
}

module.exports = {
  getProfileById,
  updateProfile,
};