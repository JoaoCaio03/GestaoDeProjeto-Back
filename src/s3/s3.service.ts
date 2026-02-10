import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  constructor(
    @Inject('S3_CLIENT') private readonly s3Client: S3Client,
    @Inject('S3_BUCKET_NAME_TOKEN') private readonly bucketName: string,
  ) {}

  async uploadFile(file: Express.Multer.File, folder: string) {
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return { key, url: `https://${this.bucketName}.s3.amazonaws.com/${key}` };
  }

  async getPreSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
  }
}
