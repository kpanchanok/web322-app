const fs = require("fs");
const { resolve } = require("path");
var posts = [];
var categories =[];

module.exports.initialize = function () {
    return new Promise ((resolve, reject) => { //object (so it can return)
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

module.exports.addPost = function (postData){
    return new Promise ((resolve, reject) => {

        //this gets around the issue of the checkbox not sending "false" if it's unchecked)
        if(postData.published === undefined){
            postData.published = false;
        }
        else{
            postData.published = true;
        }

        //This will have the effect of setting the first new post's id to: 31, and so on.
        postData.id = posts.lenght + 1

        var year = new Date().getFullYear()
        var month = new Date().getMonth()
        var day = new Date().getDay()
        postData.postDate = `${year}-${month}-${day}`

        posts.push(postData);
        resolve(postData);
    })
}

module.exports.getPostsByCategory = function (category){
    return new Promise ((resolve, reject) => {
        let filteredPosts = posts.filter(post=>post.category == category);

        if(filteredPosts.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredPosts);
        }
        resolve(categories);
    })
}

module.exports.getPostsbyMinDate = function (minDateStr){
    return new Promise((resolve,reject) => {
        let filteredDate = posts.filter(post=> (new Date(post.postDate)) >= (new Date(minDateStr)));

        if(filteredDate.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredDate);
        }
    })
}

//unique ID that match value
module.exports.getPostById = function (id){
    return new Promise((resolve, reject) => {
        const filteredID = posts.filter(post => post.id == id);
        const uniquePost = filteredID[0];

        if (uniquePost) {
            resolve(uniquePost);
        }
        else {
            reject("No results returned");
        }
    })
}

module.exports.getPublishedPostsByCategory = function(category){
    return new Promise ((resolve, reject) => {
        var publish = posts.filter(post => post.published == true && post.category == category);
        if (publish.length == 0){
            reject("No results returned");
        }
        resolve(publish);
    })
}