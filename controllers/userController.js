const userModel =require("../models/users")
const bcrypt =require("bcrypt")
const atob =require("atob")
const jwt =require("jsonwebtoken")
const CsvParser = require("json2csv").Parser
const csv =require('csvtojson')

class userController{

    static userRegistration = async(req, resp)=>{
        const {name, email, password, password_confirmation, role} = req.body;
        const user = await userModel.findOne({email:email})
        if(user){
            resp.send({"status":"failed", "message":"email already exist"})
        }else{
            if(name && email && password && password_confirmation && role ){
                if(password === password_confirmation){
                    try {
                        const salt = await bcrypt.genSalt(10)
                        const hashPassword = await bcrypt.hash(password,salt)
                    const doc =  new userModel({
                        name:name,
                        email:email,
                        password:hashPassword,
                        role: role
                      
                    })
                    await doc.save()
                    const saved_user = await userModel.findOne({email:email})

                    // generate jwt tokken

                    const token =  jwt.sign({userID:saved_user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "5d"})
                    resp.status(201).send({"status":"success", "message":"Registration success", "token": token,user:doc})
                    } catch (error) {
                        resp.send({"status":"failed", "message":"Unable to Register"})
                    }
                }else{
                    resp.send({"status":"failed", "message":"password and confirm password doesn't match"})
                }
            }else{
                resp.send({"status":"failed", "message":"All fields are required"})
            }
        }
    }

    static userLogin = async(req, resp)=>{
        try {
            const{email, password} = req.body
            if(email && password){
                const user = await userModel.findOne({email:email})
                if(user != null){
                    const isMatch = await bcrypt.compare(password, user.password)
                    if(user.email === email && isMatch){
                        // generate jet token
                        const token =  jwt.sign({userID:user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "5d"})

                        resp.send({"status":"success", "message":"Login successfully", "token":token,"user":user})

                    }else{
                        resp.send({"status":"failed", "message":"Email or password is not Valid"})

                    }

                }else{
                    resp.send({"status":"failed", "message":"You are not a registered user"})

                }

            }
            else{
                resp.send({"status":"failed", "message":"All fields are required"})

            }
        } catch (error) {
            resp.send({"status":"failed", "message":"unable to login"})

        }
    }

    static changeUserpassword = async(req, resp)=>{
        const {password, password_confirmation} = req.body
        if(password && password_confirmation){
            if(password !== password_confirmation){
                resp.send({"status":"failed", "message":"new password and confirm new password doesn't match"})

            }else{
                const salt = await bcrypt.genSalt(10)
                const hashPassword = await bcrypt.hash(password,salt)
                await userModel.findByIdAndUpdate(req.user._id, {$set:{password:newHashPassword}})
                resp.send({"status":"success", "message":"password change successfully"})

            }

        }else{
            resp.send({"status":"failed", "message":"All fields are required"})
        }

    }
    
    static loggedUser = async(req,resp)=>{
        resp.send({"user":req.user})
    }

    static allData = async(req,resp)=>{
        let data =await  userModel.find({})
        if(data){
            resp.send(data)
        }else{
            resp.send("error")
        }
    }

    static sendUserPasswordResetEmail = async(req,resp)=>{
        const {email} =req.body
        if(email){

            const user = await userModel.findOne({email:email})
            if(user){
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token =  jwt.sign({userID:user._id}, secret, {expiresIn: "15m"})
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`

                resp.send({"status":"success", "message":"password reset email sent... please check your email "})
            }else{
                resp.send({"status":"failed", "message":"email does are required"})

            }
        }else{
            resp.send({"status":"failed", "message":"Email fields are required"})

        }
    }

    static updateData = async(req,resp) =>{
        let {user} = req.body
        const{id} = req.query
        const{name,email} = req.body
        if(name && email){
            try {
                 await userModel.findByIdAndUpdate(id,req.body)
                 const saved_user = await userModel.findOne({email:email})

                resp.status(200).send({
                    status:"success",
                    message:"update successfully",
                    user: saved_user
                })
               
            } catch (error) {
                resp.status(404).send({
                    status:"failed",
                    message:"user cannot be update"
                })
            }
        }else{
            resp.send({
                status:"failed",
                message:"All fields are required"
            })
        }
       
    }

    static uploadData = async (req, res) => {
        try {
          let users = [];
          let userData = await userModel.find({});
          userData.forEach((user) => {
            const { name, email, role } = user;
            users.push({ name, email,password, role });
          });
          const csvFields = [ "Name", "Email", "role"];
          const csvParser = new CsvParser({ csvFields });
          const csvData = csvParser.parse(users);
    
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            "attatchment:filename=usersData.csv"
          );
    
          res.status(200).end(csvData);
        } catch (error) {
          res.send({ status: "failed", message: "Cannot Upload File" });
        }
      };
      static isActiveUploadData = async (req, res) => {
        try {
          let users = [];
          let userData = await userModel.find({});
          userData.forEach((user) => {
            if (user.isActive) {
              const { name, email, role } = user;
              users.push({ name, email, role });
            }
          });
          const csvFields = ["Name", "Email", 'role'];
          const csvParser = new CsvParser({ csvFields });
          const csvData = csvParser.parse(users);
    
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            "attatchment:filename=usersData.csv"
          );
    
          res.status(200).end(csvData);
        } catch (error) {
          res.send({ status: "failed", message: "Cannot Upload File" });
        }
      };
      static isInActiveUploadData = async (req, res) => {
        try {
          let users = [];
          let userData = await userModel.find({});
          userData.forEach((user) => {
            if (!user.isActive) {
              const { name, email, role } = user;
              users.push({ name, email, role });
            }
          });
    
          const csvFields = [ "Name", "Email", "Role"];
          const csvParser = new CsvParser({ csvFields });
          const csvData = csvParser.parse(users);
    
          res.setHeader("Content-Type", "text/csv");
          res.setHeader(
            "Content-Disposition",
            "attatchment:filename=usersData.csv"
          );
    
          res.status(200).end(csvData);
        } catch (error) {
          res.send({ status: "failed", message: "Cannot Upload File" });
        }
      };


      static softDeleteAndRestore = async (req, resp) => {
        let { id, isActive } = req.body;
        if (id) {
          try {
            await userModel.findByIdAndUpdate(id, { $set: { isActive: isActive } });
    
            resp.status(200).send({
              status: "success",
              message: "soft delete successfully",
            });
          } catch {
            resp.status(400).send({
              status: "failed",
              message: "could not softdelete the user",
            });
          }
        } else {
          resp.send({
            status: "failed",
            message: "id not defined",
          });
        }
      };
    
      static userDelete = async (req, resp) => {
        const { id } = req.query;
        if (id) {
          try {
            await userModel.deleteOne({ _id: id });
    
            resp.status(200).send({
              status: "success",
              message: "Permanent deleted",
            });
          } catch {
            resp.status(400).send({
              status: "failed",
              message: "could not delete the user",
            });
          }
        } else {
          resp.send({
            status: "failed",
            message: "id not defined",
          });
        }
      };

      static uploadImg = async (req, res) => {
        const { id, img } = req.body;
    
        const decodedImg = atob(img);
        if (decodedImg.length <= 200000) {
          if (id && img) {
            let data = await userModel.updateOne(
              { _id: id },
              {
                $set: { img: img },
              }
            );
            res.status(200).send({
              status: "success",
              message: "Image uploaded successfully",
              img: img,
            });
          } else {
            res
              .status(400)
              .send({ status: "failed", message: "error in uploading the image" });
          }
        } else {
          res
            .status(400)
            .send({ status: "failed", message: "Image size is too big" });
        }
      };


      

      static uploadDocument = (req, res, next) => {
        if (!req.file) {
          return res.status(400).send({
            statue: "failed",
            message: "No file uploaded",
          });
        }
        csv()
          .fromFile(req.file.path)
          .then((jsonObj) => {
            if (jsonObj.length === 0) {
              return res.send({
                statue: "failed",
                message: "csv file is empty",
              });
            }
            const requiredKeys = [
              "name",
              "email",
              "password",
              "role",
            ];
            for (const obj of jsonObj) {
              for (let key of requiredKeys) {
                if (!(key in obj)) {
                  return res.send({
                    status: "failed",
                    message: `${key} is missing in csv data`,
                  });
                }
              }
            }
            const handleAddUsers = async () => {
              const users = [];
              for (let user of jsonObj) {
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(user["password"], salt);
                users.push({
                  name: user["name"],
                  email: user["email"],
                  password: hashPassword,
                  role: user["role"],
                });
              }
              userModel
                .insertMany(users)
                .then(() => {
                  res.status(200).send({
                    status: "success",
                    message: "Successfully Uploaded!",
                  });
                })
                .catch((error) => {
                  res.status(500).send({
                    message: "Failed to upload data",
                    error,
                    status: "failed",
                  });
                });
            };
            handleAddUsers();
          })
          .catch((error) => {
            res.status(500).send({
              message: "Failed to parse CSV",
              error,
              status: "failed",
            });
          });
      };


}

module.exports = userController