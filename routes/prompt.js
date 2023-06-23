var express = require('express');
const { create } = require('../services/Prompt');
var router = express.Router();

router.get("/", async(req, res)=>{
    try{
        const prompt = await find(req?.query || {});
        return res.json(prompt);
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

router.post("/", async(req, res)=>{
    try{
        const prompt = await create(req.body);
        return res.json(prompt);
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

module.exports = router;