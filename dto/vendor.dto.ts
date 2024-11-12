import { ObjectId } from "mongoose";

export interface CreateVendorInput{
    name : string;
    ownerName : string;
    foodType : string[];
    pincode : string;
    address : string;
    phone : string;
    email : string;
    password : string;
}

export interface VendorLoginInput {
    email : string;
    password : string;
}

export interface EditVendorProfileInput {
    name : string;
    ownerName : string;
    phone : string;
    foodType : string[];
    email : string;
}

export interface EditVendorLocationInput {
    address : string;
    pincode : string;
    lat : number;
    lng : number;
}

export interface VendorPayload {
    _id : string;
    email : string;
    name : string;
}

