const Data = require('./models/data');

const NodeCache = require('node-cache');

// Configure cache with TTL of 1 hour and check period of 2 hours
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 7200 });

function makeID(length) {
    // Use a more efficient method for ID generation
    return Buffer.from(Math.random().toString(36) + 
           Math.random().toString(36))
           .toString('base64')
           .slice(0, length);
}

async function findOrigin(id) {
    try {
        // Check if the URL is in the cache
        const cachedUrl = cache.get(id);
        if (cachedUrl) {
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

async function shortUrl(url, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const newID = makeID(5);
        try {
            const originUrl = await findOrigin(newID);
            if (!originUrl) {
                await create(newID, url);
                return newID;
            }
        } catch (err) {
            if (attempt === maxRetries - 1) {
                throw new Error('Failed to generate unique short URL');
            }
        }
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
            id: makeID(5),
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

module.exports = {
    findOrigin,
    shortUrl,
    deleteUrl,
    getAllUrls,
    bulkCreate
};
