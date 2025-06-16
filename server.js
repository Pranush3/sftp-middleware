const express = require('express');
const SFTPClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.post('/sftp-upload', async (req, res) => {
  const { filename, data } = req.body;

  if (!filename || !data) {
    return res.status(400).send({ error: 'Missing filename or data' });
  }

  const buffer = Buffer.from(data, 'base64');
  const tempPath = path.join(__dirname, filename);
  fs.writeFileSync(tempPath, buffer);

  const sftp = new SFTPClient();
  const sftpConfig = {
    host: 'mcmt-7nv1q6hv3gxktfpbqxjzrby.ftp.marketingcloudops.com',
    port: 22,
    username: '100012007_9',
    password: 'Sai@12345',
    privateKey: fs.readFileSync(path.join(__dirname, 'SFTP Private key.ppk')),
    passphrase: 'Sai@12345',
  };

  try {
    await sftp.connect(sftpConfig);
    await sftp.put(tempPath, '/Import/opportunities.csv');
    await sftp.end();
    fs.unlinkSync(tempPath);
    res.send({ message: 'Upload successful' });
  } catch (err) {
    console.error('SFTP Error:', err);
    res.status(500).send({ error: 'SFTP upload failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
