import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "rz8im4s2",
  api_key: process.env.CLOUDINARY_API_KEY || "813141821818597",
  api_secret: process.env.CLOUDINARY_API_SECRET || "V9Jlml95AQcDbF1poCSTuPBcy4E",
  secure: true,
});

export default cloudinary;
