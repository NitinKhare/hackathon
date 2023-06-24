require('dotenv').config({path:__dirname+'/../.env'})
const { Configuration, OpenAIApi } = require("openai");
const { find } = require('./Prompt');
const queue = require('../queue');
const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const model = "gpt-3.5-turbo"
const temperature = 0.8

const ABOUT_PLUM = `
Introduce me as Sarvesh, co-founder at Plum. Pitch Plum to cater 
to the company's end-to-end healthcare landscape. Mention that Plum is an insurtech company funded by Sequoia
 and Tiger Global. Plum has 3000+ customers including 20+ unicorns. Limit the subject line to 6 words.
  The pitch must include USP in 3 bullets. Each bullet must have only a single line and be within 10
   words. The USPs of Plum are: Comprehensive medical insurance from India’s leading insurers and a
    suite of preventive health benefits, Modern benefits including LGBTQ cover and mental illness 
    cover, Plum mobile application to increase employee adoption and HRMS integration for the ease
     of HR operations, Assisted claims filing through WhatsApp and 24*7 cashless support.
      Write a personalised email. Email must be under 100 words. The email must be creative and 
      formal.
The email must not include the below texts: ‘I hope this email finds you’ and 
‘Thank you for considering Plum as your trusted partner in enhancing your employee health 
insurance

    Whenever you generate a cold email add a personal touch with the 
    information of the company we provide you with. Talk more about the company we are selling to then about Plum and partenering with Plum can 
    help them.
`;
/*
Structure of details
{
    email: String,
    LeadName:String
    companyName: String,
    companyContext: String,
    keywords: String,
    companyHomePage:String,
    companyAboutPage: String
}



*/
function parseDetailsAsPrompt(details){
    let text = ""
    if(details.leadName){
        text+=" The Person to Contact is "+details.LeadName;
    }
    if(details.leadDesignationName){
        text+=" The contact's designation is :  "+details.leadDesignationName;
    }

    if(details.email){
        text += " We have to send email to : "+details.email;
    }
    if(details.companyName){
        text += " The name of the company is "+details.companyName;
    }
    if(details.companySize){
        text += " The size of the company is : "+details.companySize;
    }
    if(details.industryType){
        text +=" THe company operates in the sector : "+details.industryType;
    }
    if(details.employeeCount){
        text += " The no of employees in the company is : "+details.employeeCount;
    }
    if(details.keywords){
        text += " The company is associated with following keywords : "+details.keywords; 
    }
    if(details.companyContext){
        text += " Here is what we got to know about the company : "+details.companyContext; 
    }
    if(details.companyHomePage){
        text += " Here is what we extracted from the company's website home page : "+details.companyHomePage.replace(/\n|\r|\t|\s{2,}/g, " ");
    }
    if(details.companyAboutPage){
        text += "Here is what the company publicly say about themselves "+ details.companyAboutPage.replace(/\n|\r|\t|\s{2,}/g, " ");
    }
    if(details.abmName){
        text += ` My name is ${details.abmName} add it to the email signature`
    }

    return text;
}

module.exports.generateEmail = async(details)=>{
    try{
    let text = parseDetailsAsPrompt(details)
    let content= 'You are an expert cold email writer. Your task is to generate personalized cold email on the basis of customer Data and infromation we provide to you to sell our product which is named Plum Here is the description about Plum :'+ABOUT_PLUM + " Generated email must be formatted and should not contain any escape sequence characters";
    console.log("openAI ======>", details)
    if(details.promptAlias){
        const getPrompt = await find({alias: details.promptAlias});
        if(!getPrompt.success){
            throw new Error(getPrompt.message);
        }
        if(!getPrompt.data || !getPrompt.data.length ){
            throw new Error('Invalid prompt Alias provided')
        }
        content = getPrompt.data[0].prompt;
        console.log("content to use =====>", content)
    }
    console.log("respone ====BEFIRE=>", content, details)
    const companyName = details.companyName
    const response = await openai.createChatCompletion({
        model,
        messages:[{
            'role': 'system',
            content
        },{
            role: 'user',
            content: `Write me a email selling our product plum to the company named ${companyName}, here is the description we found about the company, `+text +". Add personal touch based on the description we gave to you in the email"
        }],
        temperature,
      });
      if(response?.data?.choices[0]?.message?.content){
        return {success: true, message: response?.data?.choices[0]?.message?.content}
      }
      return {success: false, message:"Unable to generate"}
    }catch(e){
        console.log("HERE ==========>")
        console.error(e)
    }
    } 