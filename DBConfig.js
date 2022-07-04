
const { default: mongoose } = require('mongoose');
const Mongoose=require('mongoose');
const Validator=require('validator')
const ResetSchema=Mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        validate:(value)=>{
           return Validator.isEmail(value)
        }
    },
    password:{
        type:String,
        required:true,
        
    },
    otpString:{
        type:String,
        required:false
    },
    ExpiresIn:{
        type : String,
        required:false,
    },
    loggedIn:{
        type:Boolean,
        required:false,
        default:false
    }
})

const ResetDetails=Mongoose.model('userdata',ResetSchema)
module.exports={ResetDetails};