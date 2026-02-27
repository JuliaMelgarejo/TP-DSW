import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./photo.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";
import fs from 'fs';
import path from 'path';
import { orm } from '../zshare/db/orm.js';
import { Animal } from '../animal/animal.entity.js';
import { Photo } from './photo.entity.js';
import multer from "multer";



export const photoRouter = Router();

photoRouter.get('/', findAll)
photoRouter.get('/:id', findOne)
photoRouter.post('/', add)
photoRouter.put('/:id', update)
photoRouter.delete('/:id', remove)

const em = orm.em.fork();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const animalId = req.params.id;
    const dir = path.join(process.cwd(), "uploads", "animals", animalId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, `photo-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  // opcional: validación básica
  fileFilter: (req, file, cb) => {
    const ok = file.mimetype.startsWith("image/");
    if (!ok) return cb(new Error("Only image files are allowed"));
  return cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

photoRouter.post(
  "/animal/:id",
  //validateToken,
  upload.single("photo"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const animal = await em.findOneOrFail(Animal, { id });

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // URL pública accesible por el front
      const publicUrl = `/uploads/animals/${id}/${req.file.filename}`;

      const photo = em.create(Photo, {
        url: publicUrl,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        animal: animal,
        // product: null  (si lo dejás nullable)
      });

      animal.photos.add(photo);
      await em.flush();

      return res.status(201).json({ message: "photo uploaded", data: photo });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);