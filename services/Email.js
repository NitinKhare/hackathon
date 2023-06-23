const Email = require("../db/models/Email");

module.exports.findById = async (id)=>{
    try{
        const result = await Email.findById(id);
        return {success: true, data: result}
    }catch(e){
        console.log("error =====>", e.message)
        return {success: false, message: e.message}
    }
}

module.exports.find = async (filter={})=>{
    try{
        const result = await Email.find(filter);
        return {success: true, data: result}
    }catch(e){
        return {success: false, message: e.message}
    }
}

module.exports.create = async (emailData)=>{
    try{
        const email = new Email(emailData);
        const result = await email.save();
        return {success: true, data: result}
    }catch(e){
        console.log("Error ======>", e)
        return {success: false, message: e.message}
    }
}