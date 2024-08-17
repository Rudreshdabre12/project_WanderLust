const cloudinary = require('./cloudinary');
const data = require('./data');
const crypto = require('crypto');

// Function to generate a random public_id
const generatePublicId = () => crypto.randomBytes(16).toString('hex');

const uploadImages = async () => {
  const maxConcurrentUploads = 2; // Set the number of concurrent uploads

  for (let i = 0; i < data.length; i += maxConcurrentUploads) {
    const chunk = data.slice(i, i + maxConcurrentUploads);

    const uploadPromises = chunk.map(async (item) => {
      const { url } = item.image;
      const publicId = generatePublicId(); // Generate a random public_id

      try {
        const uploadResponse = await cloudinary.uploader.upload(url, {
          public_id: publicId,
          folder: 'listings',
        });

        return {
          ...item,
          image: {
            ...item.image,
            url: uploadResponse.secure_url,
          },
        };
      } catch (error) {
        console.error('Error uploading image:', error);
        return null;
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        console.log('Image uploaded successfully:', result.value);
      } else {
        console.log('Failed to upload image:', result.reason);
      }
    });
  }
};

uploadImages();
