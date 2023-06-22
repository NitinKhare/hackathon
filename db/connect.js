const mongoose = require('mongoose');
const options = {
    useNewUrlParser: true,
  };

mongoose.connect(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER_URL}/${process.env.MONGO_DB}`, options).then(()=>{
    console.log("Connected to mongoDB");
})
.catch((err)=>{
    console.log("Error",err);
    process.exit(1);
});


