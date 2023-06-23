const {Queue, tryCatch} =require('bullmq');


const queue = new Queue('leads',{ connection: {
    host: "127.0.0.1",
    port: 6379
  }});


module.exports = queue;