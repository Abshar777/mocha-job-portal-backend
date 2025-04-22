import { S3Client } from "@aws-sdk/client-s3";
import { config } from "dotenv";
config();

export const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY || "",
        secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
    },
    region: process.env.BUCKET_REGION || "",
});
