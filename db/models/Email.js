const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EmailSchema = new Schema({
  organisationInfo:  { type: Schema.Types.ObjectId, ref: 'OrganisationInfo'},
  email: String,
  emailContent:{type: String, required: true},
  autoSend: {type: Boolean, default: true}
});

module.exports = mongoose.model("Email", EmailSchema);