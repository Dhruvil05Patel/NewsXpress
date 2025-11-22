const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
// Middleware to verify Firebase ID token (optional; adapt path if different)
const { verifyIdTokenMiddleware } = require('../middleware/auth');
// Import models (adjust path/exports if your project differs)
const { UserInteraction, Article, Profile } = require('../models');

// List bookmarks for a profile
router.get('/api/profiles/:profileId/bookmarks', verifyIdTokenMiddleware, async (req, res) => {
  const { profileId } = req.params;
  try {
    const bookmarks = await UserInteraction.findAll({
      where: { profile_id: profileId, bookmark_timestamp: { [Op.ne]: null } },
      include: [{ model: Article, as: 'article' }],
      order: [['bookmark_timestamp', 'DESC']],
    });
    res.json({ bookmarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch bookmarks' });
  }
});

// Create/Upsert a bookmark
router.post('/api/profiles/:profileId/bookmarks', verifyIdTokenMiddleware, async (req, res) => {
  const { profileId } = req.params;
  const { article_id, note, articleData } = req.body;
  try {
    // optional: create article if not exists (if you store articles)
    if (articleData && article_id) {
      await Article.findOrCreate({
        where: { id: article_id },
        defaults: articleData,
      });
    }

    // find existing interaction or create a new one
    const [interaction, created] = await UserInteraction.findOrCreate({
      where: { profile_id: profileId, article_id },
      defaults: {
        profile_id: profileId,
        article_id,
        bookmark_timestamp: new Date(),
        note: note || null,
      },
    });

    if (!created) {
      // update existing (toggle bookmark_timestamp to now and update note)
      interaction.bookmark_timestamp = new Date();
      if (note !== undefined) interaction.note = note;
      await interaction.save();
    }

    res.json({ success: true, interaction });
  } catch (err) {
    console.error('bookmark create error', err);
    res.status(500).json({ error: 'Could not save bookmark' });
  }
});

// Remove bookmark (set bookmark_timestamp = null OR delete the interaction)
router.delete('/api/profiles/:profileId/bookmarks/:articleId', verifyIdTokenMiddleware, async (req, res) => {
  const { profileId, articleId } = req.params;
  try {
    const interaction = await UserInteraction.findOne({
      where: { profile_id: profileId, article_id: articleId }
    });
    if (!interaction) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    // approach A: simply nullify bookmark_timestamp (keeps history of interaction)
    interaction.bookmark_timestamp = null;
    await interaction.save();

    // approach B: delete the row if you prefer:
    // await interaction.destroy();

    res.json({ success: true });
  } catch (err) {
    console.error('bookmark delete error', err);
    res.status(500).json({ error: 'Could not remove bookmark' });
  }
});

module.exports = router;
