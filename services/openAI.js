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
Write a personalised cold email to a prospect.

Goal: 
to elicit a response from the prospect.

Objectives:
Given the additional context below, use personalisation and a targeted approach to engage the prospect.
Persuade them to take action by replying to the email
Establish trust and credibility by using the below pointers on Plum

Context about Plum, trust, credibility and its USP:
Plum is an insurtech company funded by Sequoia and Tiger Global.
Plum has 3000+ customers including 20+ unicorns
Plum provides comprehensive medical insurance from India's leading insurance manufacturers and a suite of preventive health benefits for employees.
Plum's mobile application increases employee adoption and hence, employees value corporate-sponsored benefits
Plum has HRMS integrations for ease of HR operations
Plum provides assisted claims filing through WhatsApp and 24*7 cashless support

Context about prospect:
[variable_text_about_prospect]

Instructions for writing:
Write a clear and compelling email
Limit the subject line to 6 words
Plum's pitch must include the USPs and trust factors in 3 bullet points
Each bullet point must have only a single line and be within 10 words
Email must be under 200 words 
Email should be creative and yet formal
Introduce me as [variable_name] from Plum

Remember:
When personalising the email, only write about employee health insurance and health benefits, do not make up any other insurance product.`;
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
    let content= ABOUT_PLUM;
    console.log("openAI ======>", content)
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