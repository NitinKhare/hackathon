const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const leadsSchema = new Schema({
  organisationName: String,
  organisationUrl: {type: String, required: true},
  organisationSize: String,
  leadName: String,
  aboutPage: String,
  email: {type: String, required: true},
  leadLinkedinId: String,
  status: {type: String, enum : ['UNPROCESSED','PROCESSING','PROCESSED'], default: "UNPROCESSED"},
  websiteHomePageData: String,
  websiteAboutPageData: String,
  linkedinIdScrappedData: String
});

module.exports = mongoose.model("leads", leadsSchema);