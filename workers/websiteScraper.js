const {Worker} = require('bullmq');
const { getPageContent } = require('../services/Scraper');
const Leads = require('../db/models/Leads');
const OrganisationInfo = require('../db/models/OrganisationInfo');
const { upsertOrganisationInfo } = require('../services/OrganisationInfo');
const { generateEmail } = require('../services/openAI');
const LeadsData = require('../db/models/LeadsData');
const { create } = require('../services/Email');
const { sendEmail } = require('../services/emailNotification');
require('dotenv').config({path:__dirname+'/../.env'});

require('../db/connect');

const worker = new Worker('leads', async job => {
    try{
    console.log("job ======>", job.name, job.data)
    if(job.name == 'lead'){
        const lead = await Leads.findById(job.data.id)
        if(!lead){
            throw new Error(`Invalid lead with id : ${job.data.id}`)
        }
        await Leads.findByIdAndUpdate(lead._id, {status: "PROCESSING"})
        const getHomePageData = await scrapDataFromWebsite(lead.organisationUrl);
        const OrganisationInfoObject = {
            websiteHomePageData: null,
            websiteAboutPageData: null,
            generatedKeywords: lead.keywords,
            companyContext: lead.context,
            autoSend: lead.autoSend || false
        }
        if(getHomePageData.success){
            OrganisationInfoObject.websiteHomePageData = getHomePageData.data
        }
        let getAboutPageData = await scrapDataFromWebsite(lead.aboutPage);
        if(getAboutPageData.success){
            OrganisationInfoObject.websiteAboutPageData =  getAboutPageData.data
            if(getAboutPageData.data && typeof getAboutPageData.data == 'string' && (getAboutPageData.data.toLowerCase().includes('page not found') || getAboutPageData.data.includes('404'))){
                getAboutPageData = await scrapDataFromWebsite(lead.organisationUrl +"/about-us");
                if(getAboutPageData.success && !(getAboutPageData.data.includes('Page Not Found') || getAboutPageData.data.includes('404')) ){
                    OrganisationInfoObject.websiteAboutPageData = getAboutPageData.data
                }else{
                    OrganisationInfoObject.websiteAboutPageData = null;

                }
            }else{
                OrganisationInfoObject.websiteAboutPageData = null;
            }
        }
        await upsertOrganisationInfo(lead, OrganisationInfoObject);
        await Leads.findByIdAndUpdate(lead._id, {status: "PROCESSED"})
    }

    if(job.name === 'orgInfo'){
        console.log("data ====>", job.data);
        await generateEmailContent(job.data.id, job.data.leadId)
    }
}catch(e){
    console.error(e)
}
  },{ connection: {
    host: "127.0.0.1",
    port: 6379
  }});


const scrapDataFromWebsite = async(url) =>{
    try {
       const pageContent = await getPageContent(url);
       if(!pageContent.success){
        return {success: false, error: pageContent?.error};
       } 
       return {success: true, data: pageContent.data}
    } catch (error) {
        console.error("Error : ===========>", error);
        return {success: false, error: error.message}
    }
}


const generateEmailContent = async (orgInfoId, leadId) =>{
    try{
        console.log("generateEmailCOntent ")
        const orgInfo = await OrganisationInfo.findById(orgInfoId);
        if(!orgInfo){
            throw new Error('No orgInfo found');
        }
        const lead = await Leads.findById(leadId);
        if(!leadId){
            throw new Error("No LeadId found");
        }
        console.log("orgInfo ============>", orgInfo)
        const email = await generateEmail({
            email : lead.email,
            LeadName: lead.name,
            companyName: lead.organisationName,
            companySize: lead.organisationSize,
            companyContext: orgInfo.companyContext,
            companyHomePage: orgInfo.websiteHomePageData,
            companyAboutPage: orgInfo.websiteAboutPageData,
            abmName: lead.abmName || "Sarvesh Singh"
        })
        let createdEmail = await create({organisationInfo: orgInfoId,email:lead.email ,emailContent: email.message, autoSend: lead.autoSend || false})
        console.log("createdEmail ", createdEmail);
        //parsing logic
        let textMessage =  email.message.split('\n')
        let subject = textMessage[0].split(`Subject:`).pop()
        let body =  textMessage.splice(1, textMessage.length)
        console.log("textMessage =====>",subject)
        let text = "";
        for(let i =0; i<body.length; i++){
            text +=body[i]+"\n"
        }
        await sendEmail({
            from:process.env.GMAIL_ID,
            to:lead.email,
            subject: subject,
            text: text
        })
    }catch(e){
        console.log("error in generating email ======>", JSON.stringify(e, null, 2))
        return {success: false, message: e.message}
    }
}

