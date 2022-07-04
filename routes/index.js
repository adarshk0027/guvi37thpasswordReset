var express = require('express')
var router = express.Router()
const nodeMailer = require('nodemailer')
//const BodyParser = require('body-parser')
const Mongoose = require('mongoose')
require('dotenv').config()
const {
  ResetDetails
} = require('../DBConfig')
const crypto = require('crypto')
const cors = require('cors')


router.use(cors())

//DataBase Connectio Set Up
const DbUrl = process.env.DB_URL
Mongoose.connect(process.env.DB_URL)
Mongoose.connection
  .once('open', () => console.log('Connected Mongoose'))
  .on('error', error => {
    console.log('My Error:::' + error)
  })
//DataBase Connection Finished
let CURRENT_EMAIL = ''

let transporter = nodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
})

//Checking Email Is IN DataBase Or Not
router.post('/check-email', async (req, res) => {
  try {
    console.log(req.body)
    const EmailFind = await ResetDetails.find({
      email: req.body.email
    })
    if (EmailFind) {
      res.status(200).json({
        message: "email got it ",
        login: true
      })
    } else {
      res.send({
        StatusCode: 400,
        Message: 'data not find',
        login: false
      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: 'Something Wrong'
    })
  }
})
//Router For Register
//ADD Email And Password To DataBase
router.post('/register', async (req, res) => {
  try {

    const Already_User = await ResetDetails.findOne({
      email: req.body.email
    }).exec()
    if (Already_User) return res.status(400).json({
      message: "User Exist Alrady"
    })
    else {
      const Create = await ResetDetails.create(req.body)
      if (Create) return res.status(200).json({
        message: "user Registered succesFully"
      })
      else return res.status(400).json({
        message: "something wrong"
      })
    }

  } catch (error) {
    console.log(error)
    res.send({
      StatusCode: 400,
      Message: 'Inteernal Server Error'
    })
  }
})

//  Router For Send Mail
//Send the Link To Particular Mail Address
router.post('/send', async (req, res) => {
  try {
    CURRENT_EMAIL = req.body.values.email
    console.log(CURRENT_EMAIL);
    const randomString = crypto.randomBytes(3).toString('hex')
    let mailOptions = {
      from: 'adarshkdev27@gmail.com',
      to: req.body.values.email,
      subject: 'testing email',
      html: `<a href="http://localhost:3000/otp"> OtpVerification : ${randomString} </a>`,
      text: randomString
    }

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log(' Mail error is', err)
      } else {
        console.log('email sent')
      }
    })
    const addMinutes = (minute) => {
      const time = new Date()
      const addedTime = time.setMinutes(time.getMinutes() + minute)
      const timestring = new Date(addedTime).toLocaleTimeString()
      return timestring
    }
    const InsertOTP = await ResetDetails.updateOne(req.body.values, {
      $set: {
        otpString: randomString,
        ExpiresIn: addMinutes(8)

      }
    })
    if (InsertOTP) return res.status(200).json({
      message: "otp send to email"
    })
    else return res.status(400).json({
      message: "sending error"
    })

  } catch (error) {
    console.log(error)
    res.send({
      StatusCode: 400,
      Message: 'Internal Error'
    })
  }
})

router.get('/send', function (req, res) {

  res.render('index')
})

//
router.post('/verification', async (req, res) => {
  console.log("otp", req.body);

  try {
    const deadDate = new Date().toLocaleTimeString()
    const FindData = await ResetDetails.findOne({
      email: req.body.email
    })
    console.log(FindData);
    if (FindData.ExpiresIn > deadDate) {
      console.log(FindData.ExpiresIn);
      if (FindData.otpString === req.body.OtpString) {
        console.log("successs!!!");
        res.status(200).json({
          message: "Otp Verified Success"
        })


      } else {
        res.status(400).json({
          message: "Otp Not Match"
        })
      }
    } else {
      return res.status(400).json({
        message: "time expires please Try Again"
      })
    }

  } catch (error) {
    console.log(error)
    res.status(400).json({
      message: 'Something Wrong'
    })
  }
})

router.post('/Change', async (req, res) => {
  try {
    console.log(req.body);
    const passwordChanged = await ResetDetails.updateOne({
      email: CURRENT_EMAIL
    }, {
      $set: {
        password: req.body.password
      }
    })
    if (passwordChanged) {
      return res.status(200).json({
        message: "password changed successfuly"
      })
    } else return res.status(400).json({
      message: "password Not Changed"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      StatusCode: 400,
      Message: "Something Wrong!!!"
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const UserAvailable = await ResetDetails.findOne({
      email: req.body.email
    }).exec()
    if (UserAvailable) {
      if (UserAvailable.password == req.body.password) {
        return res.status(200).json({
          mesage: req.body.email
        })
      } else return res.status(400).json({
        message: "Password Is Not Correct"
      })
    } else return res.status(400).json({
      message: "user Not Exist"
    })
  } catch (err) {
    console.log(err);
  }
})


module.exports = router