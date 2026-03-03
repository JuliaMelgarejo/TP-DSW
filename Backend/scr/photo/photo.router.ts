import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./photo.controler.js";
import { validateToken } from "../validate-token/validate-token.routes.js";
import fs from 'fs';
import path from 'path';
import { orm } from '../zshare/db/orm.js';
import { Animal } from '../animal/animal.entity.js';
import { Photo } from './photo.entity.js';
import multer from "multer";
import { Product } from "../product/product.entity.js";



export const photoRouter = Router();

photoRouter.get('/', findAll)
photoRouter.get('/:id', findOne)
photoRouter.post('/', add)
photoRouter.put('/:id', update)
photoRouter.delete('/:id', remove)

const em = orm.em.fork();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { type, id } = req.params;
    const dir = path.join(process.cwd(), "uploads", type, id);
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
  "/:type/:id",
  upload.single("photo"),
  async (req, res) => {
    try {
      const { type, id } = req.params;
      const numericId = Number(id);

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let entity: any;
      let photoData: any = {
        url: `/uploads/${type}/${id}/${req.file.filename}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };

      if (type === "animal") {
        entity = await em.findOneOrFail(Animal, { id: numericId });
        photoData.animal = entity;
      } else if (type === "product") {
        entity = await em.findOneOrFail(Product, { id: numericId });
        photoData.product = entity;
      } else {
        return res.status(400).json({ message: "Invalid type" });
      }

      const photo = em.create(Photo, photoData);
      await em.flush();

      return res.status(201).json({ message: "photo uploaded", data: photo });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
);