const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");


const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const uploadAndResize = [
  upload.single("image"),
  async (req, res, next) => {    
    try {
      if (!req.file) return next();

      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const ext = ".jpeg";

      const filename = `${timestamp}-${random}${ext}`;
      const filepath = path.join(uploadsDir, filename);

      await sharp(req.file.buffer)
        .resize({ width: 1024 })
        .jpeg({ quality: 90 })
        .toFile(filepath);


      req.file.filename = filename;
      req.file.path = filepath;
      delete req.file.buffer;

      next();
    } catch (err) {
      next(err);
    }
    
    
  },
];

module.exports = uploadAndResize;
