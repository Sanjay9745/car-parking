const Tesseract = require('tesseract.js');

const imageToText = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
            logger: m => console.log(m)
        });
        return text;
    } catch (error) {
        console.error('Error extracting text from image:', error);
        return null;
    }
}

module.exports = imageToText;