var express = require('express');
var router = express.Router();
const { INTERNAL_SERVER_ERROR, SUCCESS } = require('../utils/ErrorStatus');
const Leads = require('../db/models/Leads');
const { create, find } = require('../services/Leads');

router.post("/", async(req, res)=>{
    try{
        const created = await create(req.body)
        return res.json(created)
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})


router.get("/", async(req, res)=>{
    try{
        const leads = await find(req?.query || {});
        return res.json(leads);
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

module.exports = router;