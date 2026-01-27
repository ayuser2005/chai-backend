import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET


});

const uploadCloudinary=async (localFilePath)=> {
    try {
        if(!localFilePath) return null
        //upload the file on cloudinary
       const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
       // console.log("file uploaded on cloudinary successfully ",response.url)
       fs.unlinkSync(localFilePath) //remove the locally saved file after successful upload
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved file as the upload operation
        //  get failed
        fs.unlinkSync(localFilePath)
        return null;

    }
}

export {uploadCloudinary}