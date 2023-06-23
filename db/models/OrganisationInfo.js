const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const organisationInfoSchema = new Schema({
  organisationName: String,
  leadId:[{ type: Schema.Types.ObjectId, ref: 'leads' }],
  organisationUrl: {type: String, required: true},
  leadName: String,
  aboutPage: String,
  leadLinkedinId: String,
  websiteHomePageData: String,
  websiteAboutPageData: String,
  linkedinIdScrappedData: String,
  generatedKeywords: String,
  companyContext: String
});

module.exports = mongoose.model("OrganisationInfo", organisationInfoSchema);