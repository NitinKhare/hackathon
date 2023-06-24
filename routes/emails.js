var express = require('express');
const { createEmailReceived, sendEmailViaId, find } = require('../services/Email');
var router = express.Router();


router.post("/", async(req, res)=>{
    try{
        console.log("email api hit", req.body)
        const created = await createEmailReceived(req.body)
        return res.json(created)
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})


router.get("/send-email/:id", async(req, res)=>{
    try{
        const emailSend = await sendEmailViaId(req.params.id, req?.query?.forced);
        if(req?.query?.returnBackToDescription){
            const emails = await find({_id: req.params.id});
            return res.render("EmailDescriptionPage", {data:emails?.data[0] || {}})
        }
        return res.send(emailSend);
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

router.get("/frontend",async(req, res)=>{
    try {
        const emails = await find(req?.query || {});
       return res.render("EmailTable", {data:emails?.data|| []})

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})

router.get("/:id/frontend",async(req, res)=>{
    try {
        const emails = await find({_id: req.params.id});
       return res.render("EmailDescriptionPage", {data: emails.data[0] || {}})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})
module.exports = router;