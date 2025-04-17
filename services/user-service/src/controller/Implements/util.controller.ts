
import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import type { NextFunction, Request, Response } from "express";
import { Service } from "typedi";
import { s3 } from "../../config/s3Client";
import type { FileRequest } from "../../types/api";

@Service()
class UtilController {
    private readonly s3: S3Client;

    constructor() {
        this.s3 = s3;
    }


    /**
     * @desc    image upload
     * @req     file
     * @method  POST
     * @access  Private
     */
    async upload(req: Request, res: Response, next: NextFunction) {
        try {
            const { fileName, ContentType } = req.body;
            const Key = fileName;
            const file = req.file;
            if (!file) {
                console.log("🔴 file not found");
                res.status(400).json({ message: "file not found" });
                return
            }
            const Bucket = process.env.BUCKET_NAME || "faizy-s3";

            const Command = new PutObjectCommand({
                Key,
                Bucket,
                ContentType,
                Body: file.buffer
            })

            const fileStatus = await s3.send(Command)

            if (fileStatus['$metadata'].httpStatusCode === 200) {
                console.log("🟢 succesfully video upload to s3 bucket");

                res.status(200).json({ message: "file uploaded successfully",  url: fileName });
            } else {
                console.log("🔴 failed to upload video to s3 bucket", fileStatus);
                res.status(400).json({ message: "file uploaded failed", url: null });
            }
        } catch (error) {
            next(error);
        }

    }

}

export default UtilController;
