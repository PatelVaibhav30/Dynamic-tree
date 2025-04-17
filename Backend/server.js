const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const serverless = require('serverless-http');

const port = 3030;

app.use(cors());
app.use(express.json());

app.post('/add-user-tree', (req, res) => {
    const { username } = req.body;
    const filePath = './trees.json';

    // Read current file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error reading file');

        let trees = {};
        try {
            trees = JSON.parse(data || '{}'); // safely handle empty file
        } catch (e) {
            return res.status(500).send('Invalid JSON format in trees.json');
        }

        if (!trees[username]) {
            trees[username] = {
                key: '0',
                label: 'Root',
                type: 'person',
                className: 'p-person',
                expanded: true,
                children: []
            };

            fs.writeFile(filePath, JSON.stringify(trees, null, 2), (err) => {
                if (err) return res.status(500).send('Error writing file');
                return res.status(200).send('User added');
            });
        } else {
            res.status(200).send('User already exists');
        }
    });
});

app.post('/update-user-tree', (req, res) => {
    const { username, data } = req.body;

    const filePath = './trees.json';

    fs.readFile(filePath, 'utf8', (err, content) => {
        if (err) return res.status(500).json({ error: 'Failed to read file' });

        let trees = JSON.parse(content);
        trees[username] = data;

        fs.writeFile(filePath, JSON.stringify(trees, null, 2), (err) => {
            if (err) return res.status(500).json({ error: 'Failed to write file' });
            res.json({ success: true });
        });
    });
});

app.get('/tree/:username', (req, res) => {
    const { username } = req.params;  // Get username from the URL
    const filePath = './trees.json';

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading trees.json:', err);
            return res.status(500).json({ error: 'Failed to read tree data.' });
        }

        const trees = JSON.parse(data);  // Parse the JSON data

        // Make sure the username is case-insensitive
        const userTree = trees[username.toLowerCase()];

        if (userTree) {
            return res.json(userTree);  // Return the user's tree
        }

        return res.status(404).json({ error: 'Tree not found for user.' });
    });
});



app.get('/', (req, res) => {
    res.json({ message: 'Hello from /api route!' });
  });

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// module.exports.handler = serverless(app);