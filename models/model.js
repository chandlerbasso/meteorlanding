const { MongoClient } = require('mongodb');
const dbConnection = 'mongodb://heroku_xkn5bmhl:p34q710onu3tkn3slcj0qqru7b@ds011725.mlab.com:11725/heroku_xkn5bmhl';
const bcrypt = require('bcrypt');
const salt = bcrypt.genSalt(10);

function createSecure(email, password, callback) {
  bcrypt.genSalt(function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      callback(email,hash);
    })
  })
}

function createUser( req, res, next) {
  createSecure( req.body.email, req.body.password, saveUser)
  function saveUser(email, hash) {
    MongoClient.connect(dbConnection, function(err, db) {
      let userInfo = {
        fname: req.body.fname,
        lname: req.body.lname,
        email: email,
        passwordDigest: hash
      }
      db.collection('users').insertOne(userInfo, function(err, result) {
        if(err) throw err;
        next();
      })
    })
  }
}

function loginUser(req, res, next){
  let email    = req.body.email
  let password = req.body.password

  MongoClient.connect(dbConnection, function(err, db){
    db.collection('users').findOne({"email": email}, function(err, user){
      if(err) throw err;
      if(user === null){
        console.log('cant find user ',email)
      } else if (bcrypt.compareSync(password, user.passwordDigest)) {
        res.user = user;
      }
      next();
    })
  })

}




module.exports = {createUser, loginUser}
