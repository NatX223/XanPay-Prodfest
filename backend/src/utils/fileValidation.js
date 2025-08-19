const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Validates if the file type is an allowed image format
 * @param {Object} file - Multer file object
 * @returns {boolean} - True if file type is valid
 */
function validateFileType(file) {
    if (!file || !file.mimetype) {
        return false;
    }
    return ALLOWED_MIME_TYPES.includes(file.mimetype);
}

/**
 * Validates if the file size is within the allowed limit
 * @param {Object} file - Multer file object
 * @returns {boolean} - True if file size is valid
 */
function validateFileSize(file) {
    if (!file || !file.size) {
        return false;
    }
    return file.size <= MAX_FILE_SIZE;
}

/**
 * Gets comprehensive validation errors for a file
 * @param {Object} file - Multer file object
 * @returns {string[]} - Array of validation error messages
 */
function getValidationErrors(file) {
    const errors = [];
    
    if (!file) {
        errors.push('No file provided');
        return errors;
    }
    
    if (!validateFileType(file)) {
        errors.push('File type not supported. Please upload JPEG, PNG, GIF, or WebP images.');
    }
    
    if (!validateFileSize(file)) {
        const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
        errors.push(`File size too large. Maximum allowed size is ${maxSizeMB}MB.`);
    }
    
    return errors;
}

/**
 * Validates a file and returns validation result
 * @param {Object} file - Multer file object
 * @returns {Object} - Validation result with isValid and errors
 */
function validateFile(file) {
    const errors = getValidationErrors(file);
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

module.exports = {
    validateFileType,
    validateFileSize,
    getValidationErrors,
    validateFile,
    ALLOWED_MIME_TYPES,
    MAX_FILE_SIZE
};