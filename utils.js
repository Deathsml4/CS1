const Data = require('./models/data');
const crypto = require('crypto');
const NodeCache = require('node-cache');

// Configure cache with TTL of 1 hour and check period of 2 hours
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 7200 });

function makeID(url) {
    // Create a hash of the URL
    const hash = crypto.createHash('sha256')
        .update(url)
        .digest('base64')
        .replace(/[+/=]/g, '') // Remove +, / and = characters
        .slice(0, 5);          // Take first 5 characters
    return hash;
}

async function findOrigin(id) {
    try {
        // Check if the URL is in the cache
        const cachedUrl = cache.get(id);
        if (cachedUrl) {
            console.log(`Cache hit for ID ${id}`);
            return cachedUrl; // Return the URL from the cache
        }

        // If not found in cache, query the database
        const record = await Data.findOne({ where: { id: id } });
        const url = record ? record.url : null;

        // Store the result in the cache before returning
        if (url) {
            cache.set(id, url);
        }

        return url;
    } catch (err) {
        console.error(`Error finding URL for ID ${id}:`, err);
        throw new Error('Failed to retrieve URL');
    }
}

async function create(id, url) {
    try {
        const newRecord = await Data.create({ id, url });
        // Add the new URL to the cache
        cache.set(id, url);
        return newRecord.id;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function shortUrl(url) {
    try {
        const newID = makeID(url);
        // Check if URL already exists
        const existingUrl = await findOrigin(newID);
        if (existingUrl === url) {
            // If the same URL was already shortened, return existing ID
            return newID;
        } else if (existingUrl) {
            // If ID collision with different URL, throw error
            throw new Error('Hash collision detected');
        }
        // Create new record
        await create(newID, url);
        return newID;
    } catch (err) {
        throw new Error(`Failed to create short URL: ${err.message}`);
    }
}

async function deleteUrl(id) {
    try {
        // Remove the URL from the database
        const result = await Data.destroy({ where: { id: id } });
        
        if (result) {
            // If the URL was successfully deleted from the database, remove it from the cache
            cache.del(id);
            return true;
        } else {
            return false; // URL not found in the database
        }
    } catch (err) {
        throw new Error(err.message);
    }
}

async function getAllUrls() {
    try {
        const records = await Data.findAll();
        return records.map(record => ({
            id: record.id,
            url: record.url
        }));
    } catch (err) {
        throw new Error(err.message);
    }
}

async function bulkCreate(urls) {
    try {
        const records = urls.map(url => ({
            id: makeID(url),
            url
        }));
        
        const created = await Data.bulkCreate(records, {
            updateOnDuplicate: ['url']
        });
        
        // Update cache for all created records
        created.forEach(record => cache.set(record.id, record.url));
        
        return created.map(record => record.id);
    } catch (err) {
        console.error('Bulk creation error:', err);
        throw new Error('Failed to create short URLs in bulk');
    }
}

async function bulkDelete(ids) {
    try {
        // Remove the URLs from the database
        const result = await Data.destroy({ 
            where: { 
                id: ids 
            } 
        });
        
        // Remove all deleted URLs from the cache
        ids.forEach(id => cache.del(id));
        
        return result; // Returns number of records deleted
    } catch (err) {
        console.error('Bulk deletion error:', err);
        throw new Error('Failed to delete URLs in bulk');
    }
}

module.exports = {
    findOrigin,
    shortUrl,
    deleteUrl,
    getAllUrls,
    bulkCreate,
    bulkDelete,
    cache
};
