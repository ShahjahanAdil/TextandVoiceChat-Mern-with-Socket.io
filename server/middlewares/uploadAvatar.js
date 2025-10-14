const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/png", "image/jpeg", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only PNG, JPEG, and WEBP are allowed"));
        }
        cb(null, true);
    },
});

module.exports = upload;