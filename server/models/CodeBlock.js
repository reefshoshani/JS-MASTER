const mongoose = require('mongoose');

const codeBlockSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    initialCode: {
        type: String,
        required: true
    },
    solution: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    hints: [{
        text: String,
        code: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('CodeBlock', codeBlockSchema); 