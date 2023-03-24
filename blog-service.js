/*const fs = require("fs");
const { resolve } = require("path");
var posts = [];
var categories =[];
*/

const Sequelize = require('sequelize');
var sequelize = new Sequelize('gwnmcosq', 'gwnmcosq', 'Z5lPDH5RlCw_02hETUzIsoSaJMM4Wf62', {
    host: 'ruby.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
});

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Post.belongsTo(Category, {foreignKey: 'category'});



module.exports.initialize = function () {
    //return sequelize.sync();
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve("sync Complete")
        }).catch(() => {
            reject("unable to sync the database")
        })
    });
};

module.exports.getAllPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll().then((data) => {
            resolve(data)
        }).catch(() => {
        reject("no results return")
        })
    });
};

module.exports.getPublishedPosts = function () {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{published: true}
        }).then((data) => {
            resolve(data)
        }).catch(() => {
        reject("no results return")
        })
    });
};

module.exports.getCategories = function () {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            Category.findAll().then((data) => {
                resolve(data)
            })
        }).catch(() => {
            reject("no results return")
        })
    });
};

module.exports.addPost = function (postData){
    return new Promise((resolve, reject) => {
        postData.published = (postData.published) ? true : false;
        for (var i in postData) {
            if (postData[i] == ""){ 
                postData[i] = null; 
            }
        }
        postData.postDate = new Date()

        Post.create(postData).then(() => {
            resolve()
        }).catch((err) => { 
            reject("unable to create post") 
        })
        
    });
}

module.exports.getPostsByCategory = function (category){
    return new Promise((resolve, reject) => {
        Post.findAll({
            where:{category: category}
        }).then((data) => {
            resolve(data)
        }).catch(() => {
        reject("no results return")
        }) 
    });
};

module.exports.getPostsbyMinDate = function (minDateStr){
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;

        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr)
                }
            }            
        }).then((data) => {
            resolve(data)
        }).catch(() => {
        reject("no results return")
        })
    });
}

//unique ID that match value
module.exports.getPostById = function (id){
    return new Promise((resolve, reject) => {

        Post.findAll({
            where:{id: id}
        }).then((data) => {
            resolve(data[0])
        }).catch(() => {
        reject("no results return")
        })
    });

}

module.exports.getPublishedPostsByCategory = function(category){
    return new Promise((resolve, reject) => {

        Post.findAll({
            where:{
                published: true,
                category: category
            }
        }).then((data) => {
            resolve(data)
        }).catch(() => {
        reject("no results return")
        })
    });
}

module.exports.addCategory = function(categoryData){
    return new Promise((resolve, reject) => {
        if(categoryData == ""){
            categoryData.category = null;
        }

        Category.create(categoryData).then(() => {
            resolve("create category succesful")
        }).catch((err) => { 
            reject("unable to create category")
        })
    });
}

module.exports.deleteCategoryById = function(id){
    return new Promise((resolve, reject) => {
        Category.destroy({
            where:{id: id}
        }).then(() => {
            resolve("delete category succesful")
        }).catch((err) => {
            reject("unable to delete category")
        })
    });
}

module.exports.deletePostById = function(id){
    return new Promise((resolve, reject) => {
        Post.destroy({
            where:{id: id}
        }).then(() => {
            resolve("delete post succesful")
        }).catch(() => {
            reject("unable to delete post")
        })
    });
}