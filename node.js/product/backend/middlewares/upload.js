const path = require("path");
const multer = require("multer");
const mime = require("mime");

let filename = "";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    let ext = mime.getExtension(file.mimetype);
    filename = `${file.fieldname + Date.now()}.${ext}`;
    cb(null, filename);
  },
});

const limits = {
  fileSize: 300000, // 限制大小300KB
  files: 1, // 限制一个文件
};

const fileFilter = (req, file, cb) => {
  // 这个函数应该调用 `cb` 用boolean值来
  // 指示是否应接受该文件
  // 拒绝这个文件，使用`false`，像这样:
  // cb(null, false);

  // 接受这个文件，使用`true`，像这样:
  // cb(null, true);

  const accessType = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (!accessType.includes(file.mimetype)) {
    // 如果有问题，你可以总是这样发送一个错误:
    cb(new Error("文件类型必须是图片格式！"));
  } else {
    cb(null, true);
  }
};
const upload = multer({ storage, limits, fileFilter }).single("companyLogo");

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.render("fail", {
        data: JSON.stringify({
          message: "文件过大",
        }),
      });
    } else if (err) {
      res.render("fail", {
        data: JSON.stringify({
          message: err.message,
        }),
      });
    } else {
      req.companyLogo = filename;
      next();
    }
  });
};
module.exports = uploadMiddleware;
