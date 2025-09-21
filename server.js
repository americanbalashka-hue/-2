import express from "express";
import multer from "multer";
import QRCode from "qrcode";
import fs from "fs";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/files", express.static("uploads"));

// Форма загрузки
app.get("/", (req, res) => {
  res.send(`
    <h2>Залей фото + видео</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="photo" accept="image/*" required/><br/><br/>
      <input type="file" name="video" accept="video/*" required/><br/><br/>
      <button type="submit">Загрузить</button>
    </form>
  `);
});

// Обработка загрузки
app.post("/upload", upload.fields([{ name: "photo" }, { name: "video" }]), async (req, res) => {
  try {
    const photo = req.files["photo"][0];
    const video = req.files["video"][0];

    // Пути к файлам
    const photoUrl = `/files/${photo.filename}`;
    const videoUrl = `/files/${video.filename}`;

    // Генерация QR с ссылкой
    const targetUrl = `${req.protocol}://${req.get("host")}${photoUrl}`;
    const qrPath = `uploads/${photo.filename}-qr.png`;
    await QRCode.toFile(qrPath, targetUrl);

    res.send(`
      <h2>Готово ✅</h2>
      <p>Фото: <a href="${photoUrl}" target="_blank">Скачать</a></p>
      <p>Видео: <a href="${videoUrl}" target="_blank">Скачать</a></p>
      <p>QR:</p>
      <img src="/files/${photo.filename}-qr.png" width="200"/>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка при загрузке файлов");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
