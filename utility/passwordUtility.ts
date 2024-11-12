import bcrypt from 'bcrypt'
import { Request } from 'express'
import jwt from 'jsonwebtoken'
import { VendorPayload} from '../dto'
import { APP_SECRET } from '../config'
import { AuthPayload } from '../dto'

export const generateSalt = async() => {
    return await bcrypt.genSalt()
}

export const generatePassword = async(password : string , salt : string) => {
    return await bcrypt.hash(password,salt)
}

export const validatePassword = async(enteredPassword : string , savedPassword : string , salt : string) => {
    return await generatePassword(enteredPassword,salt) === savedPassword
}

export const generateSignature = async (payload : VendorPayload) => {
    return jwt.sign(payload,APP_SECRET,{expiresIn : '90d'})
}

export const validateSignature = async (req: Request) => {

    try {
        const signature = req.get('Authorization')
        if(!signature) {
            throw new Error("No Authorization header provided")
        }
    
        const token = signature.split(' ')[1]
        if(!token) {
            throw new Error("Invalid token format")
        }
    
        const payload = await jwt.verify(token,APP_SECRET) as AuthPayload  // no need of await ? also check in yt backend proj
        req.user = payload // why we didnt receive this error in JS
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}