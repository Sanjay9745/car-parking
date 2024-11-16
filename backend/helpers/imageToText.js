const Tesseract = require('tesseract.js');

const imageToText = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
            logger: m => console.log(m),
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', // Adjust whitelist as needed
            psm: 6 // Assume a single uniform block of text
        });
        return text;
    } catch (error) {
        console.error('Error extracting text from image:', error);
        return null;
    }
}

module.exports = imageToText;