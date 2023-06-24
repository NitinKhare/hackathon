const Prompt = require("../db/models/Prompt");
const promptValidator = require("../validators/Prompt");

module.exports.find = async (filter={})=>{
    try{
        const result = await Prompt.find(filter);
        return {success: true, data: result}
    }catch(e){
        console.log("error =====>", e.message)
        return {success: false, message: e.message}
    }
}


module.exports.create = async (prompt)=>{
    try{
        const isValid= promptValidator.create.validate(prompt);
        if(isValid.error){
            throw new Error(isValid.error.message)
        }
        const doesPromptExist = await this.find({alias: prompt.alias});
        if(!doesPromptExist.success){
            throw new Error(doesPromptExist.message);
        }

        if(doesPromptExist.data && doesPromptExist.data.length){
            throw new Error("Prompt already Exists")
        }
        let createdPrompt = new Prompt(prompt);
        createdPrompt = await createdPrompt.save()
        return {success: true, message:'Created', data: createdPrompt}
    }catch(e){
        console.log("error =====>", e.message)
        return {success: false, message: e.message}
    }
}

