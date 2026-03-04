const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true // This forces HTTPS for all generated URLs
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'e-commerce_YOGESH',
    allowedFormats: ["png", "jpeg", "jpg"],
    quality: 'auto',
    fetch_format: 'auto',
    transformation: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' }
    ]
  },
});

module.exports = {
    cloudinary, 
    storage
};