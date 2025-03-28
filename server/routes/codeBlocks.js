const express = require('express');
const router = express.Router();
const CodeBlock = require('../models/CodeBlock');

// Get all of the code blocks
router.get('/', async (req, res) => {
    try {
        const codeBlocks = await CodeBlock.find({}, 'title description initialCode');
        res.json(codeBlocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific code block by title
router.get('/:title', async (req, res) => {
    try {
        const codeBlock = await CodeBlock.findOne({ title: req.params.title });
        if (!codeBlock) {
            return res.status(404).json({ message: 'Code block not found' });
        }
        res.json(codeBlock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 