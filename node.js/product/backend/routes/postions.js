var express = require("express");
var router = express.Router();

const { add, list, remove } = require("../controlers/positions");
const uploadMiddleware = require("../middlewares/upload");

router.post("/add", uploadMiddleware, add);
router.get("/list", list);
router.delete("/remove", remove);

module.exports = router;
