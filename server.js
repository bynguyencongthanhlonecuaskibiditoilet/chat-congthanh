import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(__dirname, "uploads");
fs.ensureDirSync(uploadPath);

// ⚙️ cấu hình
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const id = uuidv4().slice(0, 6);
    const ext = path.extname(file.originalname);
    cb(null, id + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE }
});

// API upload
app.post("/up", upload.array("files", 10), (req, res) => {
  const files = req.files;

  const urls = files.map(f => {
    return `${req.protocol}://${req.get("host")}/file/${f.filename}`;
  });

  res.json({ success: true, files: urls });
});

// serve file
app.use("/file", express.static(uploadPath));

// test
app.get("/", (req, res) => {
  res.send("🚀 Upload server đang chạy");
});

// ⚠️ RENDER PHẢI DÙNG PORT NÀY
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server chạy port " + PORT);
});
