var express = require('express');
const { createEmailReceived, sendEmailViaId } = require('../services/Email');
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
        console.log("here =======>", req.params.id)
        const emailSend = await sendEmailViaId(req.params.id);
        return res.send(emailSend);
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

module.exports = router;