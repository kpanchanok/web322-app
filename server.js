var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

var path = require("path");
var blogjs = require(__dirname + "/blog-service.js");


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
    blogjs.getPublishedPosts().then((data) => {
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

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/404page.html"));
});

// setup http server to listen on HTTP_PORT
blogjs.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log('promises failed');
});