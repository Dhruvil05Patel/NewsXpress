/**
 * Profile Service
 * Handles all database operations for user profiles.
 */

// Importing only the models this service needs from the central db config
const { Profile } = require('../config/db');
const { v5: uuidv5 } = require('uuid');

/**
 * Convert Firebase UID string to a deterministic UUID v5
 * This ensures Firebase UID strings can be stored in UUID database columns
 * @param {string} firebaseUid - The Firebase UID string
 * @returns {string} UUID formatted string
 */
function firebaseUidToUuid(firebaseUid) {
  // Use UUID v5 with a custom namespace
  // This namespace is specifically for Firebase UIDs in this app
  const FIREBASE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  
  // Generate deterministic UUID from Firebase UID
  return uuidv5(firebaseUid, FIREBASE_NAMESPACE);
} 

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

 async function findOrCreateProfileByAuthId(authId, profileData = {}) {
    try {
      if (!authId) throw new Error('authId is required');

      // Convert Firebase UID string to UUID format for database compatibility
      const profileIdFromFirebase = firebaseUidToUuid(authId);
      console.log(`🔄 Converting Firebase UID "${authId}" to UUID "${profileIdFromFirebase}"`);

      // Use Firebase UID as the profile ID (primary key)
      let profile = await Profile.findByPk(profileIdFromFirebase);
      if (profile) {
        console.log('✅ Found existing profile with id:', profileIdFromFirebase);
        return profile;
      }

      // Build new profile data - Firebase UID becomes the primary key
      const newProfileData = {
        id: profileIdFromFirebase,  // Use Firebase UID (converted to UUID) as primary key
        full_name: profileData.full_name || profileData.name || null,
        avatar_url: profileData.avatar_url || profileData.picture || null,
        username: profileData.username || null,
      };

      // Create profile normally. Username is no longer constrained to be unique
      // at the model level, so this should not fail due to username collisions.
      profile = await Profile.create(newProfileData);
      console.log('✅ Created new profile with id:', profileIdFromFirebase);
      return profile;
    } catch (error) {
      console.error('Error in findOrCreateProfileByAuthId:', error.message);
      throw new Error('Could not create or retrieve profile.');
    }
  }

module.exports = {
  getProfileById,
  updateProfile,
  findOrCreateProfileByAuthId

};