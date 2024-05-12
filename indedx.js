const express= require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const connect = require('./db');
connect();
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});
let  prompt = "briefly explain this \n";

const app = express();
app.use(cors());
const port = 5000;
app.use(fileUpload());
app.use("/",express.static('public'));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use('/auth',require('./routes/auth'))


// to get summary of the text
app.post('/text', async (req, res) => {
    if (!req.files && !req.files.pdfFile) {
        return res.status(400).send('No files were uploaded.');
    }

    const data = await pdfParse(req.files.pdfFile)
    let  prompt = "briefly explain this \n";
        prompt += data.text;
        const result = await model.generateContent(prompt);
        const response = await result.response;
      const text = response.text();
     
    
    
    res.send(text);
});

// to chat with the model
app.post('chat', async (req, res) => {
    const chat = model.startChat({
        history: req.body.history,
    })
    const msg=req.body.message;
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    res.send(text);
});