require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const AWS = require('@aws-sdk/client-s3');


const s3 = new AWS.S3Client({
    credentials:
        {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        }
});


const uploadToS3 = async (base64data, filename) => {
    const uniqueFilename = `${uuidv4()}-${filename}`;

    const base64Data = base64data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    const mimeType = base64data.split(',')[0].split(':')[1].split(';')[0];

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: uniqueFilename,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read'
    };

    const command = new AWS.PutObjectCommand(params)

    try {
        await s3.send(command);
        const objectUrl = `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

        return {
            location: objectUrl,
            key: uniqueFilename
        };
    } catch (error) {
        console.log(`Failed to upload image to S3: ${error}`);
    }
};


const deleteFromS3 = async (key) => {
    if (!key) {
        console.log(`no image key provided`);
        return;
    }

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    };

    const command = new AWS.DeleteObjectCommand(params);

    try {
        await s3.send(command);
        console.log(`Successfully deleted ${key} from S3`);
    } catch (error) {
        console.log(`Failed to delete ${key} from S3: ${error}`);
    }
};


module.exports = {
    uploadToS3,
    deleteFromS3
};
