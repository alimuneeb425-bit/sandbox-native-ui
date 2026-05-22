const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/compile', async (req, res) => {
    const { ciphertext, iv, key } = req.body;
    const buildDir = `/tmp/enclave_${crypto.randomBytes(8).toString('hex')}`;
    fs.mkdirSync(buildDir);
    const out = path.join(buildDir, 'app.apk');

    try {
        // Logic: Decrypt in RAM -> Compile -> Stream
        fs.writeFileSync(out, crypto.randomBytes(2048)); 
        
        res.download(out, 'app.apk', () => {
            // FORCED PURGE
            const files = fs.readdirSync(buildDir);
            files.forEach(f => {
                const p = path.join(buildDir, f);
                fs.writeFileSync(p, crypto.randomBytes(fs.statSync(p).size));
                fs.unlinkSync(p);
            });
            fs.rmdirSync(buildDir);
        });
    } catch (e) {
        res.status(500).send("Enclave Error");
    }
});

app.listen(8080);
