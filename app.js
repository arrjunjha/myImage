const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('docs'));

// Route for handling image conversion
app.post('/convert', upload.single('image'), async (req, res) => {
    const format = req.body.format;
    const compress = req.body.compress === 'true';
    const size = parseInt(req.body.size);

    const imagePath = req.file.path;
    const outputFilename = `converted/${req.file.filename}.${format}`;

    try {
        let image = await Jimp.read(imagePath);

        if (compress) {
            let quality = 100;
            if (size <= 50) quality = 30;
            else if (size <= 100) quality = 50;
            else if (size <= 500) quality = 70;
            else quality = 90;
            image = image.quality(quality);
        }

        image = await image.writeAsync(outputFilename);
        
        res.download(outputFilename, `output.${format}`, (err) => {
            if (err) throw err;
            fs.unlinkSync(imagePath);
            fs.unlinkSync(outputFilename);
        });

    } catch (error) {
        res.status(500).send('Error processing image');
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});