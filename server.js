const express = require('express')
const lib = require('./utils')
const app = express()
const port = 3000

app.use(express.json());

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

app.post('/create', async (req, res) => {
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

app.post('/bulk-create', async (req, res) => {
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

app.listen(port, () => {
    console.log(`CS1 app listening on port ${port}`);
})
