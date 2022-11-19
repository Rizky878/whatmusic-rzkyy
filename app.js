const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const iky = require("ikyy");
const rzky = new iky();
const app = express();
const port = process.env.PORT || 5000;

// Cretae folder
if (!fs.existsSync("./public/file")) fs.mkdirSync("./public/file");

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.set("json spaces", 2);
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const storage = multer.diskStorage({
  destination: "public/file",
  filename: (req, file, cb) => {
    cb(
      null,
      file.originalname.replace(path.extname(file.originalname), "") +
        " - " +
        makeid(3) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200000000, // 10 MB
  },
});

app.get("/", (req, res) => {
  res.status(200).render(__dirname + "/public/index.ejs");
});

app.post("/result", upload.single("file"), async (req, res) => {
  if (!req.file.path)
    return res.status(400).json({
      status: false,
      message: "No file uploaded",
    });
  const buff = fs.readFileSync(__dirname + "/public/file/" + req.file.filename);
  const ress = await rzky.search.whatmusic(buff);
  if (ress.status == 200) {
    res.status(200).render(__dirname + "/public/result.ejs", { r: ress });
  } else res.json({ status: ress.status, message: ress.message });
});

app.listen(port, () => {
  console.log("Started Server");
});
