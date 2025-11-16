/**
 * Profile Service
 * Handles all database operations for user profiles.
 */

// Importing only the models this service needs from the central db config

const crypto = require('crypto');
const { Profile } = require('../config/db');



/**
 * Convert Firebase UID string to a deterministic UUID v5
 * This ensures Firebase UID strings can be stored in UUID database columns
 * @param {string} firebaseUid - The Firebase UID string
 * @returns {string} UUID formatted string
 */
function firebaseUidToUuid(firebaseUid) {
  // This is a standard v5 UUID "namespace". 
  // It's just a constant, unique UUID to ensure the same input always
  // creates the same output.
  const FIREBASE_NS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; 

  // Create a v5 UUID hash
  const hash = crypto.createHash('sha1')
    .update(FIREBASE_NS) // Use the namespace
    .update(firebaseUid) // Use the Firebase UID
    .digest();

  // Per RFC 4122, set version to 5
  hash[6] = (hash[6] & 0x0f) | 0x50;
  // Per RFC 4122, set variant
  hash[8] = (hash[8] & 0x3f) | 0x80;

  // Convert buffer to UUID string format
  const uuid = hash.toString('hex', 0, 16)
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');

  return uuid;
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
    console.log(`🔍 ProfileService.updateProfile called with ID: ${profileId}`);
    console.log(`📦 Update data received:`, JSON.stringify(updateData, null, 2));
    
    const profile = await Profile.findByPk(profileId);
    if (!profile) {
      console.error(`❌ Profile not found for ID: ${profileId}`);
      throw new Error('Profile not found.');
    }

    console.log(`✅ Found profile:`, {
      id: profile.id,
      full_name: profile.full_name,
      current_categories: profile.categories,
      current_fcm_token: profile.fcm_token ? `${profile.fcm_token.substring(0, 20)}...` : null
    });

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

    // Update FCM token if provided
    if (updateData.fcm_token !== undefined) {
      console.log(`🔔 Setting fcm_token: ${updateData.fcm_token.substring(0, 20)}...`);
      profile.fcm_token = updateData.fcm_token;
    }

    // Update categories (expects array of strings; tolerates comma-separated string)
    if (updateData.categories !== undefined) {
      const cats = Array.isArray(updateData.categories)
        ? updateData.categories
        : typeof updateData.categories === 'string'
          ? updateData.categories
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
      // Normalize categories to lowercase to keep DB consistent
      const normalized = cats.map((c) => (typeof c === 'string' ? c.toLowerCase() : c)).filter(Boolean);
      console.log(`📂 Setting categories (normalized):`, normalized);
      profile.categories = normalized;
    }

    // Save the changes back to the database
    console.log(`💾 Saving profile changes...`);
    await profile.save();
    
    console.log(`✅ Profile updated successfully for ID: ${profileId}`, {
      new_categories: profile.categories,
      new_fcm_token: profile.fcm_token ? `${profile.fcm_token.substring(0, 20)}...` : null
    });
    return profile;

  } catch (error) {
    console.error('❌ Error in updateProfile:', error.message);
    console.error('Stack:', error.stack);
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
        email: profileData.email || null,  // Required field for database constraint
        // Optional initial values
        fcm_token: profileData.fcm_token || null,
        categories: Array.isArray(profileData.categories) ? profileData.categories : null,
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

 /**
 * Create a new user profile. (For Admin/Testing)
 * @param {object} profileData - Data for the new profile.
 * @returns {Promise<object>} The new profile.
 */
async function createProfile(profileData) {
  try {
    // Manually map the incoming keys to your database fields
    const newProfile = await Profile.create({
      id: crypto.randomUUID(), // Manually generate the UUID
      full_name: profileData.fullName,
      username: profileData.username,
      auth_id: profileData.authId
    });
    
    console.log(`✅ Profile created with ID: ${newProfile.id}`);
    return newProfile;
  } catch (error) {
    console.error('Error in createProfile:', error.message);
    throw new Error('Could not create profile.');
  }
}

module.exports = {
  getProfileById,
  updateProfile,
  findOrCreateProfileByAuthId,
  createProfile
};