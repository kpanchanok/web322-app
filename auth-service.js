const bcrypt = require('bcryptjs');

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var userSchema = new Schema({
  userName:  String,
  password: String,
  email: String,
  loginHistory: [
    {
    DateTime: Date,
    userAgent: String
    } 
  ]
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(
            "mongodb+srv://dbUser:noon6410@senecaweb.scpfph4.mongodb.net/?retryWrites=true&w=majority"
            );

        db.on('error', (err)=>{
            reject(err);
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;
          let newUser = new User(userData);
          newUser
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if (err.code === 11000) {
                reject("Username already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            });
        })
        .catch((err) => {
          console.log(err);
          reject("There was an error encrypting the password");
        });
    }
  });
};

module.exports.checkUser = function(userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .exec()
      .then((user) => {
        if (!user) {
          reject("Unable to find user: " + userData.userName);
        } else {
          bcrypt
            .compare(userData.password, user.password)
            .then((result) => {
              if (result) {
                user.loginHistory.push({
                  DateTime: new Date().toString(),
                  userAgent: userData.userAgent
                });
    
                User.updateOne(
                  { userName: user.userName },
                  { $set: { loginHistory: user.loginHistory } }
                )
                .exec()
                .then(() => {
                  resolve(user);
                })
                .catch((err) => {
                  reject("There was an error verifying the user: " + err);
                });
              } else {
                reject("Incorrect Password for user: " + userData.userName);
              }
            });
            
        }
      })
      .catch((err) => 
          reject("Unable to find user: " + userData.userName));
  });
    
};


