// cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'NagarSeva_DEV', // The name of the folder in Cloudinary
      allowedFormats: ['jpeg', 'png', 'jpg'],
      transformation: [
        { width: 550, crop: 'scale' },
        { quality: 'auto', fetch_format: 'auto' }
      ], // supports promises as well
    },
});

module.exports = {
    cloudinary,
    storage,
};