const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (req, res, next) => {
  const uploadSingle = upload.single("image");

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ success: false, message: "Dosya yüklenirken hata oluştu." });
    }

    if (!req.file) {
      return next();
    }

    try {
      const uploadFromBuffer = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "images" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      };

      const uploadResult = await uploadFromBuffer(req.file.buffer);

      req.cloudinaryResult = uploadResult;
      next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Cloudinary yüklemesi başarısız.",
        error,
      });
    }
  });
};

module.exports = uploadToCloudinary;
