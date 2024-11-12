import express from "express"
import { AdminRoute,VendorRoute } from "./routes";
import mongoose from "mongoose";
import { MONGO_URI } from "./config";
import { DB_NAME } from "./config";

const app = express()

app.use(express.json({
    limit:"16kb"
}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))


app.use('/admin',AdminRoute)
app.use('/vendor',VendorRoute)


const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`)
        console.log(`\n MongoDB Connected !! DB HOST : ${connectionInstance.connection.host}`);
    } catch(error) {
        console.log("MongoDB Connection failed : ",error);
        process.exit(1)
    }
}

connectDB()

app.listen(8000 , () => {
    
    console.log('App is listening to port 8000');

})

