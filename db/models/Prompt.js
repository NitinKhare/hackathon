const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PromptSchema = new Schema({
    prompt : { type: String, required: true },
    alias: { type: String, required: true, unique: true}
});

module.exports = mongoose.model("Prompt", PromptSchema);