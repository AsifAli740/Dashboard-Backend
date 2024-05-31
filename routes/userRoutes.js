const express = require('express')
const router =  express.Router()
const userController = require('../controllers/userController')
const checkUserAuth = require('../middleware/auth-middleware')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const incomingfileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Please upload a CSV file"), false);
    }
    cb(null, true);
  };
  const upload = multer({
    storage,
    fileFilter: incomingfileFilter,
  });


// router level middleware - to protect route
router.use('/update', checkUserAuth)
// router.use('/changepassword', checkUserAuth)
// router.use('/loggeduser', checkUserAuth)


// public routes
router.post('/register', userController.userRegistration)
router.post('/login', userController.userLogin)
router.post('/send-reset-password-email', userController.sendUserPasswordResetEmail)
router.get('/alldata', userController.allData)
router.put('/update?:id', userController.updateData)
router.get('/allusers', userController.uploadData)
router.get('/activeuser', userController.isActiveUploadData)
router.get('/inactiveuser', userController.isInActiveUploadData)
router.put('/deleterestore', userController.softDeleteAndRestore)
router.delete('/permanentdelete?:id', userController.userDelete)
router.put("/uploadimage?:id", userController.uploadImg);
router.post("/uploaddocument", upload.single("file"), userController.uploadDocument);



// protected routes
router.post('/changepassword', userController.changeUserpassword)
router.get('/loggeduser', userController.loggedUser)


module.exports = router