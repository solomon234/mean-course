const express = require("express");
const multer = require("multer");
const router = express.Router();

const Post = require("../models/post");
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype]
    let error = new Error("Invalid mime Type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images")
  },
  filename: (req,file,cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name+'-'+Date.now()+'.'+ext)
  }
});

router.post("", multer({storage: storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename
  });
  post.save()
  res.status(201).json({
    message: "success",
    post:{
      ...post,
      id: post._id,
    }

  });
});

router.put("/:id", multer({storage: storage}).single("image") , (req,res,next) => {
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol + '://' + req.get("host");
    imagePath = url +"/images/"+ req.file.filename

  }
  const post = new Post({
    _id: req.params.id,
    content: req.body.content,
    title: req.body.title,
    imagePath: imagePath
  })
  Post.updateOne({ _id: req.params.id }, post)
  .then(result => {
    console.log(result);
    res.status(200).json({message: 'Update Successfull'})
  })
})

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  console.log(pageSize)
  let fetchedPosts;
  if (pageSize && currentPage){
    postQuery
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize)
  }
  postQuery.then(documents => {
    console.log(documents)
    fetchedPosts = documents;
    return Post.count()
  })
  .then(count => {
    res.status(200).json({
      message: "get success",
      posts: fetchedPosts,
      totalPosts: count,
    });
  });
});

router.get("/:id", (req, res, next) => {
  console.log('get post route')
  Post.findById(req.params.id).then(post =>{
  if (!post)
    res.status(404).json({message: 'Not Found'})
    res.status(200).json(post)
  })
});

router.delete("/:id", (req, res, next) => {
  console.log(req.params.id);
  Post.deleteOne({ _id: req.params.id })
    .then(() => {
      console.log(res);
      res.status(201).json({
        message: "success",
      });
    })
    .catch(() => {
      console.log(res);
      res.status(400).json({
        message: "fail",
      });
    });
});

module.exports = router;
