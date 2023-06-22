const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const leadsDataSchema = new Schema({
    leads : { type: Schema.Types.ObjectId, ref: 'Leads' },
    linkedinData: String,
    homePage: String,
    aboutPage: String,
});

module.exports = mongoose.model("leadsData", leadsDataSchema);