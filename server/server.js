import express from 'express'; 
import * as dotenv from 'dotenv'; //* means everything 
import cors from 'cors'; 
import {Configuration, OpenAIApi} from 'openai'; 

dotenv.config(); 

//configuration for our apiKey 
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
}); 

const openai = new OpenAIApi(configuration); 

const app = express(); 
app.use(cors()); 
app.use(express.json()); 

//can't receive data from frontend 
app.get('/', async (req,res)=> {
    res.status(200).send({
        message: 'Hello from CodeX', 
    })
});

app.post('/',async(req,res)=> {
    try{
        const prompt = req.body.prompt; //body of the prompt 

        const response = await openai.createCompletion({ //copied from openai's api at: https://beta.openai.com/playground/p/default-openai-api?lang=node.js&model=text-davinci-003
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0, //higher temperature will mean more variability in its answer 
            max_tokens: 3000, //limit on response 
            top_p: 1,
            frequency_penalty: 0.5, //less likely to say similar paragraphs 
            presence_penalty: 0,
        }); 

        //once we get request, want to send back to the frontend 
        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error); 
        res.status(500).send({ error })
    }
})

app.listen(5000, () => console.log('Server is running on port http://localhost:5000')); 

