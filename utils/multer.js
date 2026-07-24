const multer = require("multer");
const storage = (storageLocation = "public/users") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, storageLocation);
    },
    filename: (req, file, cb) => {
      cb(null, String(Date.now()).concat("-", file.originalname));
    },
  });
const upload = (storage, filesize = 1000000) =>
  multer({ storage, limits: { filesize } });

module.exports = { storage, upload, multer };
