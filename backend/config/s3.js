require("dotenv").config();

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.AWS_BUCKET || "secguard-vehicles";

async function uploadCaptura(placa, base64Image) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const key = `capturas/${placa}-${ts}.jpg`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    })
  );

  return `https://${BUCKET}.s3.${process.env.AWS_REGION || "us-east-2"}.amazonaws.com/${key}`;
}

module.exports = { uploadCaptura };
