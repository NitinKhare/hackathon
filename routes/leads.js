var express = require('express');
var router = express.Router();
const { INTERNAL_SERVER_ERROR, SUCCESS } = require('../utils/ErrorStatus');
const Leads = require('../db/models/Leads');
const { create, find } = require('../services/Leads');
const multer  = require('multer')
const queue = require('../queue');
const  BufferStream  = require('../services/BufferStream');
const csv = require('csv-parser');
const prompt = require("../services/Prompt")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = file.originalname;
      const extension = originalName.substring(originalName.lastIndexOf('.'));
      const newFileName = file.fieldname + '-' + uniqueSuffix + extension;
      cb(null, newFileName);
    }
  });


const upload = multer({ dest: 'uploads/' });

router.post("/", async(req, res)=>{
    try{
        console.log("Creationg data =======>", req.body)
        const created = await create(req.body)
        
        if(created.success == false){
            req.error = created.message;
            return res.redirect("/leads/frontend/leadsForm")
        }
        if(req.query.frontend){
    
            return res.redirect("/leads/frontend")
        }
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

router.post("/bulk-upload",upload.single('data'), async(req, res)=>{
    try {   
        console.log("bulk upload hit =====>", req.file, req.query)
        queue.add('bulkupload', {fileName: req.file.filename, autoSend: req.query.send})
        
        return res.redirect("/leads/frontend")
        
    } catch (e) {
        return res.status(INTERNAL_SERVER_ERROR.code).json({
            success:false,
            message: e.message
        })
    }
})

router.get("/frontend/leadsForm",async(req, res)=>{
    try {
        const data = {
            error:req?.error || null
          };
          const getAllPrompt = await prompt.find();
          return res.render('LeadsForm',{...data, prompts: getAllPrompt?.data || []} );

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})

router.get("/frontend/leadsUploadForm",async(req, res)=>{
    try {
          return res.render('LeadsUploadForm', {});

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})
router.get("/frontend",async(req, res)=>{
    try {
        console.log("Here de=====>")
        const leads = await find(req?.query || {});
       return res.render("LeadsTable", {data:leads?.data|| []})

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})
module.exports = router;