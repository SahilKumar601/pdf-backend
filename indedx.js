const express= require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const connect = require('./db');
// const {PDFDocument} = require('pdf-lib');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
connect();
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

const app = express();
app.use(cors());
const port = 5000;
app.use(fileUpload());
app.use("/",express.static('public'));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
async function extractTextFromPdf(buffer) {
    const data = await pdfParse(buffer);
    const pagesText = data.text.split('\n\n'|| ' \n\n'||'\n');
    return pagesText;
}
// const extractTextFromPdf = async (pdfDoc) => {
//     const buffer = await pdfDoc.save();
//     const data = await pdfParse(buffer);
//     const pagesText = data.text.split('\n\n'|| ' \n\n');
//     return pagesText;
//   };
// app.use('/auth',require('./routes/auth'))


// to get summary of the text
// app.post('/text', async (req, res) => {
//     if (!req.files && !req.files.pdfFile) {
//         return res.status(400).send('No files were uploaded.');
//     }
//     console.log(req.files.pdfFile)
//     const data = req.files.data
//     // let  prompt = "briefly explain this \n";
//     // prompt += data.text;
//     // const result = await model.generateContent(prompt);
//     // const response = result.response;
//     const text = response.text();
//     res.send(data);
// });
// app.post('/detailedsummaries', async (req, res) => {
//     if (!req.files || !req.files.pdfFile) {
//         return res.status(400).send('No files were uploaded.');
//     }

//     const file = req.files.pdfFile.data;

//     try {
//         // const pagesText = await extractTextFromPdf(file);
//         // const filteredPagesText = pagesText.filter(text => text.trim() !== ' \n');
//         const pdfDoc = await PDFDocument.load(file);
//         const pages = pdfDoc.getPages();

//         const summaries = [];
//         for (const page of pages) {
//         const pageText = await extractTextFromPdf(page);
//         summaries.push(pageText);
//         // const prompt = "Summarize the following text:\n" + pageText;
//         // const result = await model.generateContent(prompt);
//         // const response = result.response;
//         // summaries.push(response.text());
//         }
//         // const numPages = data.numpages;  
                                                
//         // const pagesText = [];
//         // console.log(data)
//         console.log(summaries);
//         // for (let i = 0; i < numPages; i++) {
//         //     const pageData = await pdfParse(file, { pagerender: page => page.extractTextFromPdf() });
//         //     pagesText.push(pageData.text);
//         // }[];
//         // console.log("page Text ",pagesText);
// /* This code snippet is responsible for generating summaries for each page of a PDF document and
// creating a new PDF file containing these summaries. Here's a breakdown of what it does: */
//         // const summaries = [];
//         // for (let pageText of pagesText) {
//         //     const prompt = "Summarize the following text:\n" + pageText;
//         //     const result = await model.generateContent(prompt);
//         //     const response = result.response;
//         //     summaries.push(response.text());
//         // }
//         // console.log("Summaries")
//         // const doc = new PDFDocument();
//         // const filePath = './summary_output.pdf';
//         // const stream = fs.createWriteStream(filePath);

//         // doc.pipe(stream);
//         // summaries.forEach((summary, index) => {
//         //     if (index > 0) {
//         //         doc.addPage();
//         //     }
//         //     doc.text(`Summary of Page ${index + 1}`, { align: 'center', underline: true });
//         //     doc.moveDown();
//         //     doc.text(summary, { align: 'left' });
//         // });
//         // doc.end();
//         // console.log("PDF Creation Done!");
//         // console.log("Sending PDF file...")
//         // stream.on('finish', () => {
//         //     const absoluteFilePath = path.resolve(filePath);
//         //     res.sendFile(absoluteFilePath, (err) => {
//         //         if (err) {
//         //             console.error('Error sending PDF file:', err);
//         //             res.status(500).send('Error sending PDF file.');
//         //         } else {
//         //             fs.unlink(filePath, (err) => {
//         //                 if (err) console.error('Error deleting PDF file:', err);
//         //             });
//         //         }
//         //     });
//         // });
//     } catch (error) {
//         console.error('Error processing PDF:', error);
//         res.status(500).send('Error processing PDF file.');
//     }
// });
app.post('/quicksummarize', async (req, res) => {
    if (!req.files || !req.files.pdfFile) {
        return res.status(400).send('No files were uploaded.');
    }
    const file = req.files.pdfFile.data; 
    try {
        const pagesText = await extractTextFromPdf(file);
        console.log(pagesText);
        const summaries = [];
        for (let pageText of pagesText) {
            const prompt = "Provide a detailed and comprehensive explanation of the following text Don't use highlighted Text or regex\n" + pageText;
            const result = await model.generateContent(prompt);
            const response = result.response;
            summaries.push(response.text());
        }
        console.log("Summaries")
        const doc = new PDFDocument();
        const filePath = './summary_output.pdf';
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        summaries.forEach((summary, index) => {
            if (index > 0) {
                doc.addPage();
            }
            doc.text(`Summary of Page ${index + 1}`, { align: 'center', underline: true });
            doc.moveDown();
            doc.text(summary, { align: 'left' });
        });
        doc.end();
        console.log("PDF Creation Done!");
        console.log("Sending PDF file...")
        stream.on('finish', () => {
            const absoluteFilePath = path.resolve(filePath);
            res.sendFile(absoluteFilePath, (err) => {
                if (err) {
                    console.error('Error sending PDF file:', err);
                    res.status(500).send('Error sending PDF file.');
                } else {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting PDF file:', err);
                    });
                }
            });
        });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).send('Error processing PDF file.');
    }
});
app.post('/chat', async (req, res) => {
    const chat = model.startChat({
        history: req.body.history,
    })
    const msg=req.body.message;
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    res.send(text);
});