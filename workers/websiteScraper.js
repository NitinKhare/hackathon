const {Worker} = require('bullmq');
const { getPageContent } = require('../services/Scraper');
const Leads = require('../db/models/Leads');
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
        const leadUpdateObject = {
            websiteHomePageData: null,
            websiteAboutPageData: null,
            status:"PROCESSED"
        }
        if(getHomePageData.success){
            leadUpdateObject.websiteHomePageData = getHomePageData.data
        }
        const getAboutPageData = await scrapDataFromWebsite(lead.aboutPage);
        if(getAboutPageData.success){
            leadUpdateObject.websiteAboutPageData =  getAboutPageData.data
        }
        await Leads.findByIdAndUpdate(lead._id, leadUpdateObject)
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


