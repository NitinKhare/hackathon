const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EmailSchema = new Schema({
  organisationInfo:  { type: Schema.Types.ObjectId, ref: 'OrganisationInfo'},
  email: String,
  emailContent:{type: String, required: true},
  emailBody:String,
  emailSubject: String,
  emailSendTo:String,
  autoSend: {type: Boolean, default: true},
  emailSent: {type: String, default:"NO"}
});

module.exports = mongoose.model("Email", EmailSchema);