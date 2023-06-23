var express = require('express');
var router = express.Router();
const { INTERNAL_SERVER_ERROR, SUCCESS } = require('../utils/ErrorStatus');
const { find } = require('../services/OrganisationInfo');

router.get("/", async(req, res)=>{
    try{
        const orgInfo = await find(req?.query || {});
        return res.json(orgInfo);
    }catch(e){
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

module.exports = router;