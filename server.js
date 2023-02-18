/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Panchanok Kaewchinda Student ID: 145443214 Date: 18/2/2023
*
*  Online (Cyclic) Link: https://bright-scarf-dove.cyclic.app
*
********************************************************************************/ 


var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

var path = require("path");
var blogjs = require(__dirname + "/blog-service.js");

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
const { getPostById, addpost, addPost, getPostsByCategory } = require("./blog-service");
const { title } = require("process");
const upload = multer(); // no { storage: storage } since we are not using disk storage

//Set the cloudinary config
cloudinary.config({
    cloud_name: "dklclh0wa",
    api_key: "575892647679222",
    api_secret: "BMrciX3lTYISVFOHmyMiKXkfJBg",
    secure: true
  });

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public')); 

app.get("/", function(req,res){
    res.redirect('/about');
});

app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/blog", function(req,res){
    blogjs.getAllPosts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/posts", function(req,res){
    /*blogjs.getPublishedPosts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })*/

    let data = null;
    if (req.query.category){
        data = blogData.getPostsByCategory(req.query.category);
    }
    else if(req.query.minDate){
        data = blogData.getPostsbyMinDate(req.query.minDate);
    }
    else{
        data = blogjs.getAllPosts();
    }

    data.then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/categories", function(req,res){
    blogjs.getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/posts/add", function(req,res){
    res.sendFile(path.join(__dirname,"/views/addPost.html"));
});

app.post('/posts/add',upload.single("featureImage"), function (req, res) {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        
        blogData.addPost(req.body).then(post=>{
            res.redirect("/posts");
        }).catch(err=>{
            res.status(500).send(err);
        })
        //res.redirect("/posts");

    }).catch((err) => {
        res.send(err);
      });
    
});

//part3
//posts?category=value 
app.get("/post?category:value", (req,res) => {
    getPostsByCategory(req.params.value).the((data) => {
        res.send(data)
    }).catch((err) => {
        res.send(err);
    })
});

//check id that match value
app.get("/post/:value", (req, res) => {
    getPostById(req.params.value).then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send(err);
      });
});



app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404page.html"));
});

// setup http server to listen on HTTP_PORT
blogjs.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log('promises failed');
});