const ttsClient = require('../client/textToSpeechClient');
const ttsVoiceMap = require('../utils/languageVoiceMap')


async function handleTextToSpeech(req, res) {
    const {text , language_code} = req.body
    try{
        if(ttsVoiceMap[language_code] === undefined){
            res.status(404).json({error : 'Text-to-Speech for this language is not supported.'});
            return;
        }
        const ttsRequest = {
            input : {text : text},
            voice : ttsVoiceMap[language_code] || ttsVoiceMap['en'],
            audioConfig : {
                audioEncoding : 'MP3'
            }
        };

        console.log(ttsVoiceMap[language_code] );
        

        const [ttsResponse] = await ttsClient.synthesizeSpeech(ttsRequest);
        const audioContent = ttsResponse.audioContent

        const audioBuffer = Buffer.from(audioContent , 'binary')
        res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);

    }catch(error){
        console.error(error)
        res.status(500).json({error : 'Error in generating'})
    }
}

module.exports = {handleTextToSpeech}

