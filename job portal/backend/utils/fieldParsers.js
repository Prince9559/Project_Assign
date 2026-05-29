// Utility to parse boolean values from string or boolean
function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return false;
}

// Utility to parse JSON fields with error handling
function parseJsonField(field, mustBeArray = false) {
    if (!field) return null;
    let parsed;
    try {
        parsed = typeof field === 'string' ? JSON.parse(field) : field;
        if (mustBeArray && !Array.isArray(parsed)) {
            throw new Error('Field must be an array');
        }
        return parsed;
    } catch (error) {
        throw new Error(`Invalid JSON format${mustBeArray ? ' (must be array)' : ''}: ${error.message}`);
    }
}

// Utility to extract profile_pic and logo_url from req.files array
function extractProfileFiles(filesArray) {
    let profile_pic = null;
    let logo_url = null;
    if (Array.isArray(filesArray)) {
        filesArray.forEach(file => {
            if (file.fieldname === 'profile_pic') profile_pic = file.path;
            if (file.fieldname === 'logo_url') logo_url = file.path;
        });
    }
    return { profile_pic, logo_url };
}

module.exports = {
    parseBoolean,
    parseJsonField,
    extractProfileFiles,
}; 