const Email = require("../db/models/Email");
const EmailReceived = require("../db/models/EmailReceived");
const queue = require('../queue');

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

module.exports.createEmailReceived = async(emailData)=>{
    try{
        console.log("Email Received ", emailData)
        const email = new EmailReceived(emailData);
        const result = await email.save();
        return {success: true, data: result}

    }catch(e){
        return {success: false, message: e.message}
    }
}

module.exports.sendEmailViaId = async(id)=>{
    try {
        const getEmail = await Email.findOne({_id:id});
        console.log("getEmail -------->", getEmail)
        if(!getEmail){
            throw new Error('No Such Email');
        }
        await queue.add("mail", {id})
        return {success: true, message:'EMAIL SENT'}
    } catch (error) {
        return {success: false, message:error.message}
    }
}