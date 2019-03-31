
var express=require('express');
var router=express.Router();
// var category=require('../models/category');
// var Content=require('../models/Content');

// var data;
// //处理通用数据
// router.use(function(req,res,next){
//     data={
//         userInfo:req.userInfo,
//         categories:[]
//     }
//     category.find().then(function(categories){
//         data.categories = categories;
//         next();
//     })
// })

router.get('/',function(req,res){

    // data.page =Number(req.query.page || 1);
    // data.limit = 4;
    // data.category=req.query.category || '';
    // data.pages = 0;
       
    // data.counts=0;
    // data.contents=[]

    // var  where={} ;
    // if(data.category){
    //     where.category=data.category
    // }

    // Content.count().where(where).then(function(counts){
    //     data.counts=Number(counts);
    //     data.pages = Number(Math.ceil(data.counts/data.limit));
    //     data.page = Number(Math.min(data.page,data.pages));
    //     data.page = Number(Math.max(data.page,1));
    //     var skip = (data.page - 1 )*data.limit;
        
    //     return Content.where(where).find().sort({_id:-1}).skip(skip).limit(data.limit).populate(['category','user']).sort({addTime:-1});
    
    // }).then(function(contents){
       
    //     data.contents=contents;
        
    //      res.render('main/index',data);
    // })
    res.render('main/layout');
    
})
router.get('/view',function(req,res){
    var contentId = req.query.contentId || '';
    data.category=req.query.category || '';
    Content.findOne({
        _id:contentId
    }).then(function(content){
        data.content=content;
        content.views++;
        content.save();
        res.render('main/view',data);
    })
})

module.exports = router;