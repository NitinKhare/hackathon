var express = require('express');
const { create, find } = require('../services/Prompt');
const { INTERNAL_SERVER_ERROR } = require('../utils/ErrorStatus');
var router = express.Router();

router.get("/", async(req, res)=>{
    try{
        let renderTable = false;
        if(req.query.frontend){
            renderTable = true;
            delete req.query.frontend
        }
        const prompt = await find(req?.query || {});
        if(renderTable){
            return res.render("PromptTable", {data: prompt.data})
        }
        return res.json(prompt);
    }catch(e){
        console.log("error ====>", e)
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

router.post("/", async(req, res)=>{
    try{
        const prompt = await create(req.body);
        if(req.query.frontend = 1){
            if(!prompt.success){
                return res.render("PromptForm",{error:prompt.message})
            }
            return res.redirect("/prompt?frontend=1")
        }
        return res.json(prompt);
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

router.get("/create", async(req, res)=>{
    try{
        return res.render("PromptForm",{error:null})
    }catch(e){
 sad
    }
})

module.exports = router;