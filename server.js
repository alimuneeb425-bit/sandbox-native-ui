const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/compile', (req, res) => {
    const { blueprint, target } = req.body;
    const buildDir = `/tmp/b_${crypto.randomBytes(8).toString('hex')}`;
    fs.mkdirSync(buildDir);
    const outputPath = `${buildDir}/app.apk`;

    // Simulate compilation in RAM
    fs.writeFileSync(outputPath, crypto.randomBytes(1024)); 

    res.download(outputPath, "app.apk", () => {
        // SHREDDING: Overwrite and delete
        fs.writeFileSync(outputPath, crypto.randomBytes(1024));
        fs.unlinkSync(outputPath);
        fs.rmdirSync(buildDir);
    });
});

app.listen(8080);

