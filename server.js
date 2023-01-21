var express = require("express");
var expressWebServer = express();
var path = require("path"); //work with directory

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup the static folder that static resources can load from
// like images, css files, etc.
app.use(express.static('public'));

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
    //res.redirect('/views/about/.html')
    res.send("Hello World<br /><a href='/about'>Go to the about page</a>");
});

// setup another route to listen on /about
app.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);


// setup a 'route' to listen on the default url path (http://localhost)
/*expressWebServer.get("/", function(req,res){
    res.redirect('/views/about/.html')
    //res.send("Hello World<br /><a href='/about'>Go to the about page</a>");
});

// setup another route to listen on /about
expressWebServer.get("/about", function(req,res){
    res.sendFile(path.join(__dirname,"/views/about.html"));
});

// setup http server to listen on HTTP_PORT
expressWebServer.listen(HTTP_PORT, onHttpStart);
*/