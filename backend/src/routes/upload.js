const express = require('express');
const multer = require('multer');
const { validateFile } = require('../utils/fileValidation');
const { uploadImage } = require('../services/storageService');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Basic MIME type check (additional validation happens in route handler)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});

/**
 * POST /api/upload/image
 * Upload an image file to Firebase Storage
 */
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        // Check if file was provided
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file provided. Please upload an image file.'
            });
        }

        // Validate the file
        const validation = validateFile(req.file);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: validation.errors.join(' ')
            });
        }

        // Upload to Firebase Storage
        const imageUrl = await uploadImage(req.file);

        // Return success response
        res.status(200).json({
            success: true,
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error('Error in image upload route:', error);

        // Handle multer errors
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    error: 'File size too large. Maximum allowed size is 5MB.'
                });
            }
            return res.status(400).json({
                success: false,
                error: 'File upload error: ' + error.message
            });
        }

        // Handle file type errors from multer fileFilter
        if (error.message === 'Invalid file type') {
            return res.status(400).json({
                success: false,
                error: 'File type not supported. Please upload JPEG, PNG, GIF, or WebP images.'
            });
        }

        // Handle Firebase Storage errors
        if (error.message.includes('Failed to upload image to storage')) {
            return res.status(500).json({
                success: false,
                error: 'Storage service unavailable. Please try again later.'
            });
        }

        // Generic server error
        res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
});

module.exports = router;