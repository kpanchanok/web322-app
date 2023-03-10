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
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

var HTTP_PORT = process.env.PORT || 8080;

var path = require("path");
//var blogjs = require(__dirname + "/blog-service.js");
const blogData = require("./blog-service");

const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier');
const { getPostById, addpost, addPost, getPostsByCategory } = require("./blog-service");
const { title } = require("process");
const upload = multer(); // no { storage: storage } since we are not using disk storage

//AS4 handlebars
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers:{
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function (context) {
            return stripJs(context);
        }  
    }
}));
app.set('view engine', '.hbs');

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

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


app.get("/", function(req,res){
    res.redirect("/blog");
});

app.get("/about", function(req,res){
    res.render('about');
});

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/blog", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if (req.query.category) {
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        } else {
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0];

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/posts", function (req,res){
    //change
    if (req.query.category) {
        getPostsByCategory(req.query.category)
        .then((data) => {
        res.render("posts", { posts: data });
        })
        .catch((err) => {
        res.render("posts", { message: "no results" });
        });
    }
    else if (req.query.minDate) {
        getPostsByMinDate(req.query.minDate)
        .then((data) => {
        res.render("posts", { posts: data });
        })
        .catch((err) => {
        res.render("posts", { message: "no results" });
        });
    }
    else {
        blogData.getAllPosts()
        .then((data) => {
        res.render("posts", { posts: data });
        })
        .catch((err) => {
        res.render("posts", { message: "no results" });
        });
    }
});

app.get("/categories", function(req,res){
    blogData.getCategories().then((data) => {
        res.render('categories', { categories: data });
    }).catch((err) => {
        res.render('categories', {message: "no results"});
    })
});

app.get("/posts/add", function(req,res){
    res.render('addPost');
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
    res.status(404).render('404page');
    //res.status(404).sendFile(path.join(__dirname,"/views/404page.html"));
});

// setup http server to listen on HTTP_PORT
blogData.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart());
}).catch (() => {
    console.log('promises failed');
});