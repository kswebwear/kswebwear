"use server";

import { v2 as cloudinary } from "cloudinary";

export async function uploadToCloudinary(formData: FormData) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary credentials missing in environment variables");
        throw new Error("Server configuration error: Cloudinary credentials missing");
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    console.log("Starting Cloudinary upload for file:", file.name, "size:", file.size);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer created, length:", buffer.length);

    return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "designs",
                resource_type: "auto",
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload callback error:", error);
                    reject(error);
                    return;
                }
                console.log("Cloudinary upload successful:", result?.secure_url);
                resolve(result?.secure_url || "");
            }
        );

        uploadStream.on('error', (err) => {
            console.error("Upload stream error event:", err);
            reject(err);
        });

        uploadStream.end(buffer);
    });
}
