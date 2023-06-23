const Leads = require('../db/models/Leads');
const queue = require('../queue');
const leadsValidator = require('../validators/Leads');
module.exports.create = async (leadObject)=>{
    try{
        const isValid= leadsValidator.create.validate(leadObject);
        if(isValid.error){
            throw new Error(isValid.error.message)
        }
        if(leadObject.organisationUrl[leadObject.organisationUrl.length -1] == "/"){
            leadObject.organisationUrl = leadObject.organisationUrl.slice(0, leadObject.organisationUrl.length -1)
        }
        const doesLeadExist = await this.find({email: leadObject.email, organisationUrl: leadObject.organisationUrl});
        if(!doesLeadExist.success){
            return {success: false, message: 'DB_ERROR'}
        }
        if(doesLeadExist.data.length){
            return {success: false, message: 'Lead already exists'};
        }
        if(!leadObject.aboutPage){
            leadObject.aboutPage = leadObject.organisationUrl[leadObject.organisationUrl.length - 1] =="/" ? leadObject.organisationUrl+"about" : leadObject.organisationUrl+"/about"
        }
        const leads = new Leads(leadObject);
        const result = await leads.save();
        await queue.add('lead', { id: result._id });
        return {success: true, message:'Created'}
    }catch(e){
        console.log("error =====>", e.message)
        return {success: false, message: e.message}
    }
}

module.exports.find = async (filter={})=>{
    try{
        const result = await Leads.find(filter);
        return {success: true, data: result}
    }catch(e){
        console.log("error =====>", e.message)
        return {success: false, message: e.message}
    }
}

module.exports.updateStatusByOrganisationUrl = async(organisationUrl, status = 'PROCESSING') =>{
    try{
        if(!organisationUrl){
            throw new Error("Invalid Or no organisationFound");
        }
        const result = await Leads.findOneAndUpdate({organisationUrl: organisationUrl}, {status: status})
        return {success: true, data: result}
    }catch(e){
        return {success: false, message: e.message}
    }
}