import {Request , Response , NextFunction} from "express"
import { CreateVendorInput } from "../dto"
import { Vendor } from "../models"
import mongoose from "mongoose"
import { generatePassword, generateSalt } from "../utility"


export const findVendor = async(id: string | undefined, email?: string) => {
    if(email) {
        return await Vendor.findOne({email:email})
    } else{
        if(id === "" || id === undefined) return null // In case if both email and ID are not provided
        return await Vendor.findById(id)
    }
}


export const createVendor = async(req : Request , res: Response , next : NextFunction) => {
    const {name,ownerName,foodType,pincode,address,phone,email,password} = <CreateVendorInput>req.body

    const existingVendor = await findVendor('',email) // id parameter is kept as undefined so that email paramater's position is correctly read
    if(existingVendor !== null) {
        return res.json({message : "Vendor with the same email-ID already exists"})
    }

    //generate salt
    const salt = await generateSalt()

    // password encryption using salt
    const userPassword = await generatePassword(password,salt)
    
    const createdVendor = await Vendor.create({
        name : name , 
        ownerName : ownerName,
        foodType : foodType,
        pincode : pincode,
        address :address,
        phone : phone,
        email : email,
        password : userPassword,
        salt : salt,
        serviceAvailable : false,
        coverImages: [],
        rating : 0,
        lat: 0,
        lng : 0,
    })

    return res.json(createdVendor)
}

export const getVendors = async(req : Request , res : Response , next : NextFunction) => {
    
    const vendors = await Vendor.find()

    if(vendors === null) {
        return res.json({message : "No vendors added"})
    }

    return res.json(vendors)
}

export const getVendorById = async(req : Request , res: Response , next: NextFunction) => {
    const {vendorId} = req.params

    const vendor = await findVendor(vendorId)

    if(vendor === null) {
        return res.json({message : "Invalid Vendor ID - No such vendor found"})
    }

    return res.json(vendor)
}