import { Request, Response , NextFunction } from "express";
import { findVendor } from "./AdminController";
import { generateSignature, validatePassword } from "../utility";
import { EditVendorProfileInput, EditVendorLocationInput , VendorLoginInput } from "../dto";
import { Vendor } from "../models";
import { isModifier } from "typescript";

export const vendorLogin = async(req : Request , res : Response , next : NextFunction) => {
    console.log("Request body : ",req.body);
    
    const {email , password} = <VendorLoginInput>req.body

    if(!(email.trim() && password.trim())) {
        return res.json({message : "Both fields are required for login"})
    }
    
    const existingVendor = await findVendor(undefined,email)
    
    if(!existingVendor) {
        return res.json({message : "Inavlid Login credentials : Vendor with the mentioned email doesn't exist"})
    }

    const isPasswordValid = await validatePassword(password, existingVendor.password, existingVendor.salt)
    
    if(isPasswordValid) {
        const signature = await generateSignature({
            _id : existingVendor._id.toString(),
            email : existingVendor.email,
            name : existingVendor.name
        })
        return res.json({message : `Generated Signature : ${signature}`})

    } else {
        return res.json({message : "Inavlid Login credentials : Incorrect Password"})
    }

}

export const getVendorProfile = async(req : Request , res : Response , next : NextFunction) => {
    const user = req.user
    if(user) {
        const existingVendor = await findVendor(user?._id)
        if(existingVendor !== null) {
            return res.json(existingVendor)
        }
    }

    return res.json({message : "Vendor information not found"})
}

export const updateVendorProfile = async(req : Request , res : Response , next : NextFunction) => {
    try {
        const { name , ownerName , phone , foodType, email} = <EditVendorProfileInput>req.body

        const user = req.user
        if(!user) {
            return res
                   .status(401)
                   .json({
                        success : false,
                        message : "User not authenticated"
                    })
        }
        
        const existingVendor = await findVendor(user?._id)
        if(!existingVendor) {
            return res
                   .status(404)
                   .json({
                    success : false,
                    message : "Vendor not found"
                   })
        }

        let isModified = false

        // email validation
        if(email) {
            const trimmedEmail = email.trim()
            if(trimmedEmail && existingVendor.email.trim() !== trimmedEmail) {
                
                // basic email format validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if(!emailRegex.test(trimmedEmail)) {
                    return res
                           .status(400)
                           .json({
                            success : false,
                            message : "Invalid email format"
                           })
                }
                
                // check if email is already used by another vendor
                const emailExists = await Vendor.findOne({
                    email : trimmedEmail,
                    _id : {$ne : existingVendor?._id}
                })
                if(emailExists) {
                    return res
                           .status(400)
                           .json({
                            success : false ,
                            message : "Email already in use"
                           })
                }

                existingVendor.email = trimmedEmail
                isModified = true
            }
        }

        // phone validation
        if(phone) {
            const trimmedPhone = phone.trim()
            if(trimmedPhone && existingVendor.phone.trim() !== trimmedPhone) {

                // basic phone format validation
                const phoneRegex = /^\d{10}$/
                if(!phoneRegex.test(trimmedPhone)) {
                    return res
                           .status(400)
                           .json({
                            success : false,
                            message : "Invalid phone format. Phone number must contain 10 digits"
                           })
                }
                
                // check if phone number is already used by another vendor
                const phoneExists = await Vendor.findOne({
                    phone : trimmedPhone,
                    _id : {$ne : existingVendor?._id}
                })
                if(phoneExists) {
                    return res
                           .status(400)
                           .json({
                            success : false,
                            message : "Phone number already in use"
                           })
                          
                }

                existingVendor.phone = trimmedPhone
                isModified = true
            }
        }
        
        // vendor name validation
        if(name) {
            const trimmedName = name.trim()
            if(trimmedName && existingVendor.name.trim() !== trimmedName) {

                if(trimmedName.length < 2) {
                    return res
                           .status(400)
                           .json({
                            success : false,
                            message : "Name must be atleast 2 characters long"
                           })
                }

                existingVendor.name = trimmedName
                isModified = true
            }
        }

        // ownerName validation
        if(ownerName) {
           const trimmedOwnerName = ownerName.trim()
           if(trimmedOwnerName && existingVendor.ownerName.trim() !== trimmedOwnerName) {
              
              if(trimmedOwnerName.length < 2) {
                return res
                       .status(400)
                       .json({
                        success : false,
                        message : "Name must be atleast 2 characters long"
                       })
              }

              existingVendor.ownerName = trimmedOwnerName
              isModified = true
           }
        }
        

        // foodType validation
        if(Array.isArray(foodType) && foodType.length > 0) { 
            const validFoodTypes = foodType.every(element => 
                typeof element === "string" && element.trim().length>0
            )
            if(!validFoodTypes) {
                return res
                       .status(400)
                       .json({
                        success : false,
                        message : "Invalid food types provided"
                       })
            }

            if(JSON.stringify(existingVendor.foodType) !== JSON.stringify(foodType)) {
                existingVendor.foodType = foodType.map(element => element.trim())
                isModified = true
            }
        }

        if(isModified) {
            const saveResult = await existingVendor.save()
            return res
                   .status(200)
                   .json({
                    success : true,
                    message : "Profile updated successfully",
                    data : saveResult
                   })
        }

        return res
               .status(200)
               .json({
                success : true,
                message : "No changes were made",
                data : existingVendor
               })

    } catch (error) {
        console.log(error);
    }
}

export const updateVendorLocationDetails = async(req : Request , res : Response , next : NextFunction) => {
 try {
       const {address , pincode , lat , lng} = <EditVendorLocationInput>req.body
   
       const user = req.user
       if(!user) {
           return res
                  .status(401)
                  .json({
                   success : false,
                   message : "Unauhorized access"
                  })
       }
   
       const existingVendor = await findVendor(user?._id)
       if(!existingVendor) {
           return res
                  .status(404)
                  .json({
                   success : false,
                   message : "vendor not found"
                  })
       }
   
       let isModified = false
       
       // address validation
       if(address) {
           const trimmedAddress = address.trim()
           if(trimmedAddress && existingVendor.address.trim() !== trimmedAddress) {
   
               if(trimmedAddress.length < 5) {
                   return res
                          .status(400)
                          .json({
                           success : false,
                           message  : "Address must be atleast 5 characters long"
                          })
               }
   
               existingVendor.address = trimmedAddress
               isModified = true
           }
       }
       
       // pincode validation
       if(pincode) {
           const trimmedPincode = pincode.trim()
           if(trimmedPincode && existingVendor.pincode.trim() !== trimmedPincode) {
   
               // pincodes in india are 6 digits long
               const pinRegex = /^\d{6}$/
               if(!pinRegex.test(trimmedPincode)) {
                   return res
                          .status(400)
                          .json({
                           success : false,
                           message : "Invalid pincode format. Pincode must comprise of 6 digits"
                          })
               }
   
               existingVendor.pincode = trimmedPincode
               isModified = true
           }
       }
   
       // lat & lng validation
       if(lat !== undefined && lng !== undefined) {

           if(isNaN(lat) || isNaN(lng)) { // The isNaN() method converts the value to a number before testing it.
                  return res
                         .status(400)
                         .json({
                            success : false,
                            message : "Latitude & Longitude must be valid numbers"
                         })
           }
           
           // Validate latitude (-90 to 90)
           if(lat < -90 || lat > 90) {
            return res
                   .status(400)
                   .json({
                    success : false,
                    message : "Invalid Latitude.It must be within the (-90,90) range"
                   })
           }
           
           // Validate longitude (-180 to 180)
           if(lng < -180 && lng > 180) {
            return res
                   .status(400)
                   .json({
                    success : false,
                    message : "Invalid longitude. It must be within the (-180,180) range"
                   })
           }

           if(existingVendor.lat !== lat || existingVendor.lng !== lng) {
            existingVendor.lat = lat
            existingVendor.lng = lng
            isModified = true
           }
       }

       if(isModified) {
        const saveResult = await existingVendor.save()
        return res
               .status(200)
               .json({
                success : true,
                message : "Successfully updated the location details",
                data : saveResult
               })
       }

       return res
              .status(200)
              .json({
                success : true,
                message : "No changes were made",
                data : existingVendor
              })

 } catch (error) {
    console.log(error);
 }

}

export const updateVendorService = async(req : Request , res : Response , next : NextFunction) => {
    // service availability would be a toggle option in the frontend. When clicked request send and this handler activated
   try {
     const user = req.user
     if(!user) {
        return res
               .status(401)
               .json({
                success : false,
                message : "Unauthorized access"
               })
     }

     const existingVendor = await findVendor(user?._id)
     if(!existingVendor) {
        return res
               .status(404)
               .json({
                success : false ,
                message : "Vendor not found"
               })
     }

     existingVendor.serviceAvailable = !existingVendor.serviceAvailable
     const saveResult = existingVendor.save()
     return res
            .status(200)
            .json({
                success : true,
                message : "Service availability toggled",
                data : saveResult
            })

   } catch (error) {
        console.log(error);
    
   }
}

// password updation ??????

