const crypto = require('crypto');

const MASTER_KEY = Buffer.from(process.env.MASTER_ENCRYPTION_KEY, 'hex');

const encryptFile = (buffer) => {
  const fileKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-cbc', fileKey, iv);
  const encryptedFile = Buffer.concat([cipher.update(buffer), cipher.final()]);
  
  const masterIv = crypto.randomBytes(16);
  const masterCipher = crypto.createCipheriv('aes-256-cbc', MASTER_KEY, masterIv);
  const encryptedKey = Buffer.concat([masterCipher.update(fileKey), masterCipher.final()]);
  
  return {
    encryptedFile,
    encryptedKey: Buffer.concat([masterIv, encryptedKey]).toString('base64'),
    iv: iv.toString('base64')
  };
};

const decryptFile = (encryptedFile, encryptedKeyBase64, ivBase64) => {
  const encryptedKeyBuffer = Buffer.from(encryptedKeyBase64, 'base64');
  const masterIv = encryptedKeyBuffer.slice(0, 16);
  const encryptedKey = encryptedKeyBuffer.slice(16);
  
  const masterDecipher = crypto.createDecipheriv('aes-256-cbc', MASTER_KEY, masterIv);
  const fileKey = Buffer.concat([masterDecipher.update(encryptedKey), masterDecipher.final()]);
  
  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', fileKey, iv);
  return Buffer.concat([decipher.update(encryptedFile), decipher.final()]);
};

module.exports = { encryptFile, decryptFile };
