import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "dev-portofolio-share-app/projects/images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1000, crop: "limit" }],
  } as object,
});

const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "dev-portofolio-share-app/profiles/csv_files",
    allowed_formats: ["pdf"],
    resource_type: "auto", // required for non-image files
  } as object,
});

export const uploadImage = multer({ storage: imageStorage });
export const uploadPdf = multer({ storage: pdfStorage });
