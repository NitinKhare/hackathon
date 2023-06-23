const {Worker} = require('bullmq');
const { getPageContent } = require('../services/Scraper');
const Leads = require('../db/models/Leads');
const OrganisationInfo = require('../db/models/OrganisationInfo');
const { upsertOrganisationInfo } = require('../services/OrganisationInfo');
const { generateEmail } = require('../services/openAI');
const LeadsData = require('../db/models/LeadsData');
const { create } = require('../services/Email');
const leads = require('../services/Leads');
const { sendEmail } = require('../services/emailNotification');
require('dotenv').config({path:__dirname+'/../.env'});
const fs = require('fs');
const csv = require('csv-parser');
const queue = require('../queue');
const Email = require('../db/models/Email');
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

    if(job.name == 'bulkupload'){
        await parseCSV(job.data)
    }

    if(job.name == "mail"){
        await sendEmailQueue(job.data)
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
        const orgInfo = await OrganisationInfo.findById(orgInfoId);
        if(!orgInfo){
            throw new Error('No orgInfo found');
        }
        const lead = await Leads.findById(leadId);
        if(!leadId){
            throw new Error("No LeadId found");
        }
        const email = await generateEmail({
            email : lead.email,
            LeadName: lead.name,
            companyName: lead.organisationName,
            companySize: lead.organisationSize,
            companyContext: orgInfo.companyContext,
            companyHomePage: orgInfo.websiteHomePageData,
            companyAboutPage: orgInfo.websiteAboutPageData,
            abmName: lead.abmName || "Sarvesh Singh",
            promptAlias: lead.promptAlias
        })
        //parsing logic
        let textMessage =  email.message.split('\n')
        let subject = toTitleCase(textMessage[0].split(`Subject:`).pop())
        let body =  textMessage.splice(1, textMessage.length)
        let text = "";
        for(let i =0; i<body.length; i++){
            text +=body[i]+"\n"
        }
        let createdEmail = await create({
            organisationInfo: orgInfoId,
            email:lead.email ,
            emailContent: email.message, 
            emailSubject: subject,
            emailBody: text,
            autoSend: lead.autoSend || false
        })
        if(lead.autoSend){
            queue.add("mail", {id: createdEmail.data._id})
        }

    }catch(e){
        console.log("error in generating email ======>", JSON.stringify(e, null, 2))
        return {success: false, message: e.message}
    }
}

let toTitleCase=(str)=> {
    return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
      return match.toUpperCase();
    });
  }
const sendEmailQueue = async(data)=>{
try{
    const emailById = await Email.findById(data.id)
    console.log("Email queue -====>",emailById);
    sendEmail({
        from:process.env.GMAIL_ID,
        to:emailById.email,
        subject: toTitleCase(emailById.emailSubject),
        text: emailById.emailBody
    }).then(async()=>{
        await Email.updateOne({_id: emailById._id}, {emailSent:"YES"})
    }).catch(async()=>{
        await Email.updateOne({_id: emailById._id}, {emailSent:"ERRORED"})
    })
}catch(e){

    console.error(e)
}
}
const parseCSV = async(csvFileBuffer) =>{
    try {
        let results = [];
        console.log()
        fs.createReadStream(__dirname+'/../uploads/'+csvFileBuffer.fileName)
        .pipe(csv())
        .on('data', async (data) => {
            const leadObject = {
                organisationName: data.Company,
                organisationUrl: data.Website,
                employeeCount: data?.Employees,
                leadName: data['First Name']+" "+data["Last Name"],
                leadLinkedinId: data["Person Linkedin Url"],
                industryType: data["Industry"],
                keywords: data["Keywords"],
                city: data["City"],
                State: data["State"],
                Country: data["Country"],
                CompanyAddresss: data["Company Address"],
                autoSend: csvFileBuffer.send,
                email:data["Email"],
                leadDesignation: csvFileBuffer["Title"],
                autoSend: csvFileBuffer.autoSend
            }
            await leads.create(leadObject)
        })
        .on('end', () => {
          console.log(results);
        });    } catch (error) {
        console.log(error)
        return {success: false, message: error.message}
    }
}

