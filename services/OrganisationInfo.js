const OrganisationInfo = require("../db/models/OrganisationInfo");
const queue = require('../queue');

module.exports.find = async (filter={})=>{
    try{
        const result = await OrganisationInfo.find(filter);
        return {success: true, data: result}
    }catch(e){
        console.log("error =====>", e.message)
        return {success: false, message: e.message}
    }
}


module.exports.upsertOrganisationInfo = async(lead, OrganisationInfoObject) =>{
    try{
        let orgInfo = await OrganisationInfo.findOne({organisationUrl: lead.organisationUrl});
        if(!orgInfo){
            const organisationInfo = new OrganisationInfo({...OrganisationInfoObject, organisationUrl: lead.organisationUrl});
            orgInfo = await organisationInfo.save();
        }else{
            const mergedInfo = {
                ...orgInfo._doc,
                ...OrganisationInfoObject
            }
            await OrganisationInfo.updateOne({organisationUrl:lead.organisationUrl}, mergedInfo)
        }
        await queue.add('orgInfo', { id: orgInfo._id, leadId: lead._id });
        return {success: true}
    }catch(e){
        console.log("upsert org info error ", e)

        return {success: false, message:e.message}
    }
}