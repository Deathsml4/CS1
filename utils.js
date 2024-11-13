const Data = require('./models/data');

const NodeCache = require('node-cache');
const cache = new NodeCache();

function makeID(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
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
        throw new Error(err.message);
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
    while (true) {
        let newID = makeID(5);
        let originUrl = await findOrigin(newID);
        if (!originUrl) {
            await create(newID, url);
            return newID;
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

module.exports = {
    findOrigin,
    shortUrl,
    deleteUrl,
    getAllUrls
};
