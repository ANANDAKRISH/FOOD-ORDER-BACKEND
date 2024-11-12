import express , {Request , Response , NextFunction} from "express"
import { getVendorProfile, updateVendorLocationDetails, updateVendorProfile, updateVendorService, vendorLogin } from "../controllers"
import { authenticateRequest } from "../middlewares"

const router = express.Router()

router.get('/login',vendorLogin)

router.use(authenticateRequest)
router.get('/profile',getVendorProfile)
router.patch('/profile',updateVendorProfile)
router.patch('/location',updateVendorLocationDetails)
router.patch('/service',updateVendorService)

router.get('/',(req : Request , res : Response , next : NextFunction) => {
    res.json({message : "Hello from Vendor"})
})

export {router as VendorRoute}