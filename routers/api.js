var express=require('express');
var router=express.Router();
var User=require('../models/user');
var Boards = require('../models/board');
var Content=require('../models/content');
var responData;
//上传图片的 multer 配置
const multer = require('multer');
const path = require('path');
const lastdir = path.resolve(__dirname, '..');
var imgpath = '/public/upimgs/';
var storage = multer.diskStorage({
    destination: path.join(lastdir,'/public/upimgs'),

    filename: function (req, file, cb) {
        var str = file.originalname.split('.');
        var imgname = Date.now()+'.'+str[1];
        imgpath = imgpath + imgname;
        cb(null, imgname);
    }
})
var upload = multer({ storage: storage });//存储器

router.use(function(req,res,next){
    responData={
        code:0,
        message:''
    }
    next();
})

router.post('/user/register',function(req,res){
    var username = req.body.username;
    var password= req.body.password;
    var repassword = req.body.repassword;
    console.log(username+"---"+password+"--"+repassword);
    if(username == ''){
        responData.code=1;
        responData.message='账号不能为空';
        res.json(responData);
        return;
    }
    if(password == ''){
        responData.code=2;
        responData.message='密码不能为空';
        res.json(responData);
        return;
    }
    if(password != repassword){
        responData.code=3;
        responData.message='2次密码不一致';
        res.json(responData);
        return;
    }

    User.findOne({
        username:username
    }).then(function(userInfo){
        if(userInfo){
            responData.code=4;
            responData.message='用户已被注册';
            res.json(responData);
        return;
        }
        var user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function(newUserInfo){
        
        responData.message='注册成功,即将返回登录界面';
        res.json(responData);
    })


    
});
router.post('/user/login',function(req,res){
    var username = req.body.username;
    var password= req.body.password;
    console.log(username + '--'+password);
    if(username == '' || password == ''){
        responData.code = 1;
        responData.message = '用户名和密码不能为空';
        res.json(responData);
        return;
    }
    User.findOne({
        username:username,
        password:password
    }).then(function(userInfo){
        if(!userInfo){
            responData.code = 2;
            responData.message = '用户名或密码错误';
            res.json(responData);
            return;
        }
        responData.message = '登陆成功';
        responData.userInfo=userInfo;
        //登录成功设置cookies
        req.cookies.set('userInfo',JSON.stringify(
            {
                _id:userInfo._id,
                username:userInfo.username,
            }
        ));
        console.log(req.cookies.get('userInfo'));
        res.json(responData);
    })

})
router.post('/user/UpateInfo',function(req,res){
    var nicheng = req.body.nicheng;
    var sex = req.body.sex;
    var disc = req.body.disc;
    var faculty = req.body.faculty;
    var Class = req.body.Class;
    var _id = req.body._id;
    console.log(nicheng+"--"+sex+"--"+disc+"--"+faculty+"--"+Class+"--"+_id)
    if(req.body.username == ''){
        responData.code = 1;
        responData.message = '用户名为空';
        res.json(responData);
        return;
    }
    if(req.body.nicheng == ''){
        responData.code = 2;
        responData.message = '不能为空';
        res.json(responData);
        return;
    }
    
    User.update({
        _id:_id
    },{
        nicheng : req.body.nicheng,
        sex : req.body.sex,
        disc : req.body.disc,
        faculty : req.body.faculty,
        Class : req.body.Class,
        _id : req.body._id
    }).then(function(info){
        responData.message = '文字上传成功';
        responData.userInfo = info
        res.json(responData);
        return;
    });
})
router.post('/user/UpateInfoImg',upload.single('photo'),function(req,res){
    var id = req.userInfo._id
    responData.message = '上传成功';
    responData.imgpath = imgpath;
    console.log("更新个人头像路径："+responData.imgpath);
    User.update({
        _id:id
    },{
        head_img:imgpath
    }).then(function(info){
        if(!info){

        }
        return User.findOne({
            _id:id
        })
    }).then(function(userInfo){
        console.log(userInfo);
        responData.message = '信息上传成功';
        responData.userInfo = userInfo;
        res.json(responData);
        return;
    })
})

router.get('/user/logout',function(req,res){
    req.cookies.set('userInfo',null);
    responData.message = '退出成功！';
    res.json(responData);
})
//展示评论
// router.get('/comment',function(req,res){
//     var contentId = req.query.contentId || '';
//     Content.findOne({
//         _id:contentId
//     }).then(function(content){
//         responData.data = content;
//         res.json(responData);
//     })
// })

//添加公告
router.post('/boards/addInfo',function(req,res){
    var item = req.body.item;
    var b_theme = req.body.b_theme;
    var b_disc = req.body.b_disc;
    var _id = req.body._id;
    console.log(item+"---"+b_theme+"--"+b_disc+"---"+_id);

    new Boards({
        item: item,
        b_theme: b_theme,
        b_disc:b_disc,
        b_release: req.userInfo._id.toString(),
    }).save().then(function(Boardinfo){
        console.log(Boardinfo);
        responData.message = '发布公告成功！';
        req.userInfo.addBoard_id= Boardinfo._id.toString();
        console.log(req.userInfo,"info");
        res.json(responData);
        return;
    });
})
//添加公告图片
router.post('/boards/addInfoImg',upload.array("file",20),function(req,res){
    console.log(req.userInfo,"img");
    var addBoard_id= req.userInfo.addBoard_id;
    var arr = [];
    for(var i in req.files){
        
        arr.push(req.files[i].path);
    }
    console.log(arr);
    // Boards.update({
    //     _id:addBoard_id
    // },{
    //     b_img:arr
    // }).then(function(info){
    //     if(!info){
    //         responData.message = '公告上传失败！';
    //         res.json(responData);
    //         return;
    //     }
    //     responData.message = '公告上传成功';
    //     responData.userInfo = userInfo;
    //     res.json(responData);
    //     return;  
    // })
})
//评论提交

router.post('/comment/post',function(req,res){
    var contentId = req.body.contentId || '';
    var postData = {
        username:req.userInfo.username,
        postTime:new Date(),
        content:req.body.messageContent
    };
    Content.findOne({
        _id:contentId
    }).then(function(content){
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent){
        
        responData.message = '评论成功！';
        responData.data = newContent;
        res.json(responData);
    })

})
module.exports = router;