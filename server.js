const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Client = require('ssh2-sftp-client');
const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json({ limit: '10mb' }));

app.post('/upload', async (req, res) => {
  const { ftpHost, ftpPort, ftpUsername, filename } = req.body;

  // Path to the OpenSSH private key (converted from .ppk)
  const privateKeyPath = path.join(__dirname, 'id_rsa'); // make sure file exists
  const passphrase = 'your_passphrase_here'; // set your actual passphrase

  if (!ftpHost || !ftpUsername || !filename) {
    return res.status(400).send('Missing required fields');
  }

  const sftp = new Client();

  try {
    await sftp.connect({
      host: ftpHost,
      port: parseInt(ftpPort) || 22,
      username: ftpUsername,
      privateKey: fs.readFileSync(privateKeyPath),
      passphrase: passphrase || Sai@12345
    });

    // Example: dummy content for upload
    const dummyBuffer = Buffer.from('Hello from Node.js middleware');
    await sftp.put(dummyBuffer, `/upload/${filename}`);
    await sftp.end();

    res.send('File uploaded successfully using private key!');
  } catch (err) {
    console.error('SFTP Upload Error:', err);
    res.status(500).send('SFTP upload failed');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
