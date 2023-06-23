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
    if(details.abmName){
        text += ` My name is ${details.abmName} add it to the email signature`
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
            content: 'You are an expert cold email writer. Your task is to generate personalized cold email on the basis of customer Data and infromation we provide to you to sell our product which is named Plum Here is the description about Plum :'+ABOUT_PLUM + " Generated email must be formatted and should not contain any escape sequence characters"
        },{
            role: 'user',
            content: `Write me a email selling our product plum to the company named ${details.companyName}, here is the description we found about the company, `+text +". Add personal touch based on the description we gave to you in the email"
        }],
        temperature,
      });
      console.log(JSON.stringify(response.data, null ,2))
      if(response?.data?.choices[0]?.message?.content){
        return {success: true, message: `${response?.data?.choices[0]?.message?.content}`}
      }
      return response.data;
    } 