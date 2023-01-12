var CryptoJS = require("crypto-js");
const encrypt = (value) => {
  let encrypted = CryptoJS.AES.encrypt(value, process.env.SECRET_JS).toString();
  encrypted = encodeURIComponent(
    encrypted
      .replace("+", "xMl3Jk")
      .replace("/", "Por21Ld")
      .replace("=", "Ml32")
  );
  return encrypted;
};

const decrypt = (value) => {
  value = decodeURIComponent(
    value.replace("xMl3Jk", "+").replace("Por21Ld", "/").replace("Ml32", "=")
  );
  let decrypted = CryptoJS.AES.decrypt(value, process.env.SECRET_JS).toString(
    CryptoJS.enc.Utf8
  );
  return decrypted;
};

let encryptChatId = (chatId) => {
  let encrypted = CryptoJS.AES.encrypt(
    chatId,
    process.env.SECRET_JS
  ).toString();
  return encrypted;
};
let decryptChatId = (chatId) => {
  let encrypted = CryptoJS.AES.decrypt(
    chatId,
    process.env.SECRET_JS
  ).toString();
  return encrypted;
};
const encryption = { encrypt, decrypt, encryptChatId, decryptChatId };
module.exports = encryption;
