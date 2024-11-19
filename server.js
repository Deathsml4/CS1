const express = require('express')
const lib = require('./utils')
const rateLimit = require('express-rate-limit')
const app = express()
const port = 3000

app.use(express.json());

// Add rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // limit each IP to 10 URL creations per hour
});

const bulkCreateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 bulk creations per hour
    message: {
        error: 'Too many bulk creation requests, please try again later'
    }
});

const bulkDeleteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 bulk deletions per hour
});

// Apply general rate limiting to all requests
app.use(generalLimiter);

app.get('/short/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const url = await lib.findOrigin(id);
        if (url == null) {
            res.send("<h1>404</h1>");
        }
        else {
            res.send(url);
        }
    } catch (err) {
        res.send(err)
    }
})

app.post('/create', createLimiter, async (req, res) => {
    try {
        const url = req.query.url;
        const newID = await lib.shortUrl(url);
        res.send(newID);

    } catch (err) {
        res.send(err)
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const success = await lib.deleteUrl(id);
        
        if (success) {
            res.send(`<h1>URL with ID ${id} deleted successfully</h1>`);
        } else {
            res.send("<h1>404 - URL not found</h1>");
        }
    } catch (err) {
        res.send(err.message);
    }
});

app.get('/urls', async (req, res) => {
    try {
        const urls = await lib.getAllUrls();
        res.json(urls);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/bulk-create', bulkCreateLimiter, async (req, res) => {
    try {
        // Expect an array of URLs in the request body
        const urls = req.body.urls;
        
        // Validate input
        if (!Array.isArray(urls)) {
            return res.status(400).json({
                error: 'Request body must contain a "urls" array'
            });
        }
        
        if (urls.length === 0) {
            return res.status(400).json({
                error: 'URLs array cannot be empty'
            });
        }
        
        // Call the bulkCreate function
        const shortIds = await lib.bulkCreate(urls);
        
        res.json({
            success: true,
            shortIds: shortIds
        });

    } catch (err) {
        console.error('Bulk creation error:', err);
        res.status(500).json({
            error: err.message || 'Failed to create short URLs'
        });
    }
});

app.delete('/bulk-delete', bulkDeleteLimiter, async (req, res) => {
    try {
        // Expect an array of IDs in the request body
        const ids = req.body.ids;
        
        // Validate input
        if (!Array.isArray(ids)) {
            return res.status(400).json({
                error: 'Request body must contain an "ids" array'
            });
        }
        
        if (ids.length === 0) {
            return res.status(400).json({
                error: 'IDs array cannot be empty'
            });
        }
        
        // Call the bulkDelete function
        const deletedCount = await lib.bulkDelete(ids);
        
        res.json({
            success: true,
            deletedCount: deletedCount,
            message: `Successfully deleted ${deletedCount} URLs`
        });

    } catch (err) {
        console.error('Bulk deletion error:', err);
        res.status(500).json({
            error: err.message || 'Failed to delete URLs'
        });
    }
});

app.listen(port, () => {
    console.log(`CS1 app listening on port ${port}`);
})
