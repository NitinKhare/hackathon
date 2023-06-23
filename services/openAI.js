require('dotenv').config({path:__dirname+'/../.env'})
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const model = "gpt-3.5-turbo"
const temperature = 0.8

const ABOUT_PLUM = `
Plum which is the Best employee benefits and digital healthcare platform in India.
 Get transparent pricing & a quick online purchase experience with Plum Insurance
 . Our aspiration to make access to care easier in companies pushed us to dive deeper into 
 the basics, i.e. health. With a common inclination towards building products people love,
  our founders set out to speak with teams of all kinds, only to discover that the
   insurance system was broken! And here we are, solving the hairy world of insurance -
    imagining and co-creating products from the ground up to positively impact the 
    health and financial wellbeing of every human as we go. 
    The USPs of Plum are: Comprehensive medical insurance from India's leading insurers and a suite of preventive health benefits, Modern benefits including LGBTQ cover and mental illness cover, Plum mobile application to increase employee adoption and HRMS integration for the ease of HR operations, Assisted claims filing through WhatsApp and 24*7 cashless support

    Whenever you generate a cold email add a personal touch with the 
    information of the company we provide you with. Talk more about the company we are selling to then about Plum
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
    console.log("details ========>", details)
    if(details.leadName){
        text +=" The Person to Contact is "+details.LeadName;
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
    if(details.keywords){
        text += " The company is associated with following keywords : "+details.keywords; 
    }
    if(details.companyContext){
        text += " Here is what we got to know about the company : "+details.companyContext; 
    }
    if(details.companyHomePage){
        text += " Here is what we extracted from the company's website home page : "+details.companyHomePage;
    }
    if(details.companyAboutPage){
        text += "Here is what the company publicly say about themselves "+ details.companyAboutPage;
    }

    return text;
}

module.exports.generateEmail = async(details)=>{

    let text = parseDetailsAsPrompt(details)
    console.log("text ===>",text);
    const response = await openai.createChatCompletion({
        model,
        messages:[{
            'role': 'system',
            content: 'You are an expert cold email writer. Your task is to generate personalized cold email on the basis of customer Data and infromation we provide to you to sell our product which is named Plum Here is the description about Plum :'+ABOUT_PLUM
        },{
            role: 'user',
            content: `Write me a email selling our product plum to the company named ${details.companyName}, here is the description we found about the company, `+text +". Add personal touch based on the description we gave to you in the email"
        }],
        temperature,
      });
      console.log(JSON.stringify(response.data, null ,2))
      return response.data;
    } 