const fs = require("fs");
var posts = [];
var categories =[];

//module.exports.readMessage = function () 

module.exports.initialize = function () {
    return new Promise ((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) {
                reject ("unable to read file");
            }
            else {
                posts = JSON.parse(data);
            }
        });

        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
            if (err) {
                reject ("unable to read file");
            }
            else {
                categories = JSON.parse(data);
            }
        });
        resolve();
    })
};

module.exports.getAllPosts = function () {
    return new Promise ((resolve, reject) => {
        if (posts.length == 0){
            reject("No results returned");
        }
        resolve(posts);
    })
};

module.exports.getPublishedPosts = function () {
    return new Promise ((resolve, reject) => {
        var publish = posts.filter(post => post.published == true);
        if (publish.length == 0){
            reject("No results returned");
        }
        resolve(publish);
    })
};

module.exports.getCategories = function () {
    return new Promise ((resolve, reject) => {
        if (categories.length == 0){
            reject("No results returned");
        }
        resolve(categories);
    })
};