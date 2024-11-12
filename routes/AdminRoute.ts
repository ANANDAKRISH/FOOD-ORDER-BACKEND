import express , {Request , Response , NextFunction} from 'express'
import {createVendor,getVendors,getVendorById} from '../controllers'

const router = express.Router()

router.post('/vendor',createVendor)
router.get('/vendors',getVendors)
router.get('/vendor/:vendorId',getVendorById)

router.get('/',(req : Request , res : Response , next : NextFunction) => {
    res.json({message : "Hello from Admin"})
})

export {router as AdminRoute}

