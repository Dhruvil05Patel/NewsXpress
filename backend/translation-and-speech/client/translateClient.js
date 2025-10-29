require('dotenv').config()
const {Translate} = require('@google-cloud/translate').v2

const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS


const translateClient = new Translate({
    keyFileName : filePath
})

module.exports = translateClient