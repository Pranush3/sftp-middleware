const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json({ limit: '10mb' }));

app.post('/upload', async (req, res) => {
  const {
    ftpHost,
    ftpPort,
    ftpUsername,
    filename,
    fileData,
    passphrase // <-- Include passphrase from the client (optional)
  } = req.body;

  if (!ftpHost || !ftpUsername || !filename || !fileData) {
    return res.status(400).send('Missing required fields');
  }

  const sftp = new Client();
  const buffer = Buffer.from(fileData, 'base64');

  try {
    const privateKey = fs.readFileSync(path.join(__dirname, 'id_rsa'));

    await sftp.connect({
      host: ftpHost,
      port: parseInt(ftpPort) || 22,
      username: ftpUsername,
      privateKey: privateKey,
      passphrase: passphrase || '' // supply your passphrase here if encrypted
    });

    await sftp.put(buffer, `/upload/${filename}`);
    await sftp.end();

    res.send('File uploaded successfully!');
  } catch (err) {
    console.error('SFTP upload failed:', err.message);
    res.status(500).send('SFTP upload failed');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
