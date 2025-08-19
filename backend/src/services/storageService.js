const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const dotenv = require('dotenv');
const { storage } = require('../utils/firebase');
dotenv.config();

/**
 * Generates a unique filename with timestamp and UUID
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
function generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    // Sanitize the base name to prevent path traversal
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    return `images/${timestamp}-${uuid}-${sanitizedBaseName}${extension}`;
}

/**
 * Uploads an image file to Firebase Storage
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - Public URL of uploaded image
 */
async function uploadImage(file) {
    try {

        const bucket = storage.bucket();
        
        // Generate unique filename
        const filename = generateUniqueFilename(file.originalname);
        
        // Create file reference in bucket
        const fileRef = bucket.file(filename);
        
        // Upload file buffer to Firebase Storage
        await fileRef.save(file.buffer, {
            metadata: {
                contentType: file.mimetype,
                metadata: {
                    originalName: file.originalname,
                    uploadedAt: new Date().toISOString()
                }
            }
        });
        
        // Make the file publicly readable
        await fileRef.makePublic();
        
        // Return public URL
        return getPublicUrl(filename);
        
    } catch (error) {
        console.error('Error uploading image to Firebase Storage:', error);
        throw new Error('Failed to upload image to storage');
    }
}

/**
 * Gets the public URL for a file in Firebase Storage
 * @param {string} filename - Filename in storage
 * @returns {string} - Public URL
 */
function getPublicUrl(filename) {
    // Get the storage bucket name from Firebase config
    const storage = admin.storage();
    const bucket = storage.bucket();
    
    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

/**
 * Deletes an image from Firebase Storage
 * @param {string} filename - Filename to delete
 * @returns {Promise<void>}
 */
async function deleteImage(filename) {
    try {
        const storage = admin.storage();
        const bucket = storage.bucket();
        const fileRef = bucket.file(filename);
        
        await fileRef.delete();
    } catch (error) {
        console.error('Error deleting image from Firebase Storage:', error);
        throw new Error('Failed to delete image from storage');
    }
}

module.exports = {
    uploadImage,
    generateUniqueFilename,
    getPublicUrl,
    deleteImage
};