var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require("path");
var Schema = mongoose.Schema;


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, './views'));
app.use(express.static(__dirname + "/static"));
// app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded({ extended: true }));


var PostSchema = new mongoose.Schema({
    name: {type:String, required: true },
    text: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment', minlength:4 }]
}, { timestamps: true });
// The 'type' property of the object inside of the array is an attribute
// that tells Mongoose what to look for.

// What would we need to add to make the below snippet work properly? Read your console!
var CommentSchema = new mongoose.Schema({
    // since this is a reference to a different document, the _ is the naming convention!
    name: {type:String, required: true, minlength:4 },
    _post: { type: Schema.Types.ObjectId, ref: 'Post' },
    text: { type: String, required: true, minlength:4 },
}, { timestamps: true });

mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

var dbURI = 'mongodb://localhost/mongooses'
mongoose.connect(dbURI);

app.get('/', function(req, res){
    Post.find({}).populate('comments')
        .exec(function (err, post) {
            res.render('index', { data: post });
        });
})

// app.get('/', function(req, res){
//     Post.find({}, function(err, result){
//         if(err){'index', {errors: err.errors}}
//     }).populate('comments', function(err, result){
//         res.render('index', {data:result})
//     })
// })


app.post('/post', function(req, res){
    var post = new Post(req.body)
    post.save(function (err, data) {
        if (err) { res.render('index', { errors: err.errors }) }
        res.redirect('/')
    })
})


app.post('/posts/:id', function (req, res) {
    Post.findOne({ _id: req.params.id }, function (err, post) {
        var comment = new Comment(req.body);
        comment._post = post._id;
        post.comments.push(comment);
        comment.save(function (err) {
            post.save(function (err) {
                if (err) { console.log('Error'); }
                else { res.redirect('/'); }
            });
        });
    });
});


app.listen(8000, function () {
    console.log("Listening on port 8000, and then some...")
})