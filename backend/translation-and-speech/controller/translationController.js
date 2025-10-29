// routes/translation.js
const express = require('express')
const translateClient = require('../client/translateClient.js')

async function translationController (req, res){
    const { text, language_code } = req.body;
    try {
        const [translationResult] = await translateClient.translate(text, language_code);
        res.json({ translation: translationResult });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Translation failed' });
    }
}



module.exports = {translationController};