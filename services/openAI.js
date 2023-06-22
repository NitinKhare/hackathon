require('dotenv').config({path:__dirname+'/../.env'})
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const model = "text-davinci-003"
const temperature = 0.6

const ABOUT_PLUM = ``;

async function generateEmail(){
    const response = await openai.createCompletion({
        model,
        prompt: "Say this is a test",
        max_tokens: 7,
        temperature,
      });
      console.log(response.data)
    } 

gen()