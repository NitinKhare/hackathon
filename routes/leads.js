var express = require('express');
var router = express.Router();
const { INTERNAL_SERVER_ERROR, SUCCESS } = require('../utils/ErrorStatus');
const Leads = require('../db/models/Leads');
const { create, find } = require('../services/Leads');
const multer  = require('multer')
const queue = require('../queue');
const  BufferStream  = require('../services/BufferStream');
const csv = require('csv-parser');


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
            return res.render('LeadsForm', {error : created.message, data:req.body});
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
        queue.add('bulkupload', {fileName: req.file.filename, autoSend: req.query.send})
        if(req.query.frontend){
            return res.redirect("/leads/frontend")
        }
        res.send()
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
            error:null
          };
          return res.render('LeadsForm', data);

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})

router.get("/frontend/leadsUploadForm",async(req, res)=>{
    try {
          return res.render('LeadsUploadForm', data);

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})
router.get("/frontend",async(req, res)=>{
    try {
       return res.send("jello")

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
})
module.exports = router;