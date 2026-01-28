import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiErrors.js';
import {User} from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiRespose.js';


const generateAccessAndRefreshToken= async(userId)=>{   
       try {
        const user= await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({ validateBeforeSave:false })

         return {accessToken,refreshToken}

       } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access token")
       }
}

const registerUser = asyncHandler(async (req, res) => { 

    
        //get user details from the frontend
        //validation - not empty 
        //check if user already exist:username,email
        //check for images,check for avtar
        //upload them to cloudinary,avtar
        //create user object -create entry in db
        //remove password and refresh token field from response
        //check for user creation
        //return res
         
        const {fullName, fullname, email, username, password} = req.body
            console.log("Request Body: ", req.body);
            
            // Handle both fullName and fullname from frontend
            const name = fullName || fullname;
            
            console.log("Extracted - name:", name, "email:", email, "username:", username);

            if(
                [name, email, username, password].some((field)=> !field || field?.trim()===""))
                {
                    throw new ApiError(400,"All fields are required")
                }
            
                const existedUser=await User.findOne({
                    $or:[{ username }, { email }]
                })
        
                if(existedUser){
                    throw new ApiError(409,"user with email or username already exists")
                }
                console.log(req.files);

                const avatarLocalPath=req.files?.avatar[0]?.path
                const coverImageLocalPath=req.files?.coverImage[0]?.path;



                if(!avatarLocalPath){
                    throw new ApiError(400,"Avatar file is required ")
                }

               const avatar=await uploadCloudinary(avatarLocalPath)
               const coverImage= await uploadCloudinary(coverImageLocalPath)


             if(!avatar){
                throw new ApiError(400, "Avatar file is required ")
             }

              const user = await User.create({
                fullName: name,
                avatar: avatar.url,
                coverImage: coverImage?.url || "",
                email,
                password,
                username: username?.toLowerCase()
             })
    

              const createdUser = await User.findById(user._id).select(
                "-password -refreshToken "
              )

              if(!createdUser){
                throw new ApiError(500, "Something went wrong while registering the user")
              }

            return res.status(201).json(
                new ApiResponse(200, createdUser, "User registered Successfully ")
                
            )

 })

    const loginUser= asyncHandler(async(req,res)=>{
            //req body-> data
            //username or email
            //find the user
            //password check
            //access and refresh token
            //send cookie

            const {email,username,password}=req.body

            if(!username && !email){
                throw new ApiError(400,"Username or password is required ")
            }
            
           const user = await User.findOne({
                $or:[{username }, {email}]
            })

            if(!user){
                throw new ApiError(404,"user not found")
            }
            
            const isPasswordvalid= await user.isPasswordCorrect(password)

            if(!isPasswordvalid){
                throw new ApiError(401," password is incorrect")
            }

            const {accessToken, refreshToken }=await generateAccessAndRefreshToken(user._id)

            const loggedInUser=await User.findById(user._id).select("-password -refreshToken ")
                 //the fields which i don't want is written above
           const options={
              httpOnly: true,
              secure: true
           }

           return res
           .status(200) 
           .cookie("accessToken", accessToken,options)
           .cokkie("refreshToken", refreshToken,options)
           .json(
             new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken 
                },
                "User logged in succesfully"
             )
           )
    }) 

    const logoutUser= asyncHandler(async(req,res)=>{
         await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken:undefined
                }
            },
            {
                new:true
            }
         )
          const options={
              httpOnly: true,
              secure: true
           }

           return res
           .status(200)
           .clearCookie("accessToken",options)  
           .clearCookie("refreshToken",options)
           .json(new ApiResponse(200, {}, "User logged out "))
    })

export {
    registerUser,
    loginUser,
    logoutUser
};


 