var express=require('express');
var router=express.Router();
var User=require('../models/user');
var Boards = require('../models/board');
var Hails = require('../models/hail');
var responData;
//上传图片的 multer 配置
const multer = require('multer');
const path = require('path');
const lastdir = path.resolve(__dirname, '..');
var Bod_imgs = [];
var B_path = '/public/upimgs/';

var imgpath = '/public/upimgs/';
var user_img = ''
var storage = multer.diskStorage({
    destination: path.join(lastdir,'/public/upimgs'),

    filename: function (req, file, cb) {
        var str = file.originalname.split('.');
        var imgname = Date.now()+'.'+str[1];
        //处理单张图片
        user_img = imgname;
        //imgpath = imgpath + imgname;
        //处理多张图片
        B_path = B_path + imgname;
        Bod_imgs.push(B_path);
        B_path = '/public/upimgs/';

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
    var danshen = req.body.danshen
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
        _id : req.body._id,
        danshen
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
    responData.imgpath = imgpath +user_img;
    console.log("更新个人头像路径："+responData.imgpath);
    imgpath=imgpath +user_img;
    console.log();
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
//获取所有的用户的信息
router.get('/user/getAllList',function(req,res){
    User.find().sort({_id:-1}).then(function(usersList){
        console.log(usersList,"11111111111111111111");
        responData.message = '请求公告数据成功！';
        responData.usersList = usersList;
        res.json(responData);
    })
})
router.get('/user/logout',function(req,res){
    req.cookies.set('userInfo',null);
    responData.message = '退出成功！';
    res.json(responData);
})
//添加公告
router.post('/boards/addInfo',function(req,res){
    var item = req.body.item;
    var b_theme = req.body.b_theme;
    var b_disc = req.body.b_disc;
    var _id = req.body._id;
    console.log("---------------------------------------------------");
    console.log(item+"---"+b_theme+"--"+b_disc+"---"+_id);

    // new Boards({
    //     item: item,
    //     b_theme: b_theme,
    //     b_disc:b_disc,
    //     b_release: req.userInfo._id.toString(),
    // }).save().then(function(Boardinfo){
    //     console.log(Boardinfo);
    //     responData.message = '发布公告成功！';
    //     req.cookies.set('addBoard_id',JSON.stringify(
    //         {
    //             _id:Boardinfo._id
    //         }
    //     ));
    //     // req.userInfo.addBoard_id= Boardinfo._id.toString();
    //     console.log(req.addBoard_id,"info");
    //     res.json(responData);
    //     return;
    // });

    // var addBoard_id= req.addBoard_id;
    // Boards.updateOne({
    //     _id:addBoard_id
    // },{
    //     item: item,
    //     b_theme: b_theme,
    //     b_disc:b_disc,
    //     b_release: req.userInfo._id.toString(),
    // }).then(function(info){
    //     if(!info){
    //         responData.message = '公告上传失败！';
    //         res.json(responData);
    //         return;
    //     }
    //     responData.message = '公告上传成功';
    //     res.json(responData);
    //     return;  
    // })
})
//添加公告图片
router.post('/boards/addInfoImg',upload.array("file",20),function(req,res){
    console.log(req.addBoard_id,"img");
    console.log(Bod_imgs);
    var addBoard_id= req.addBoard_id;

    var item = req.body.item;
    var b_theme = req.body.b_theme;
    var b_disc = req.body.b_disc;
    var _id = req.body._id;
    console.log("---------------------------------------------------");
    console.log(item+"---"+b_theme+"--"+b_disc+"---"+_id);

    new Boards({
        b_img:Bod_imgs,
        item:item,
        b_theme:b_theme,
        b_disc,b_disc,
        b_release:req.userInfo._id.toString()
    }).save().then(function(Boardinfo){
        console.log(Boardinfo);
        responData.message = '图片上传成功成功！';
        req.cookies.set('addBoard_id',JSON.stringify(
            {
                _id:Boardinfo._id
            }
        ));
        res.json(responData);
        return;
    });
})
//公告的请求
router.get('/boards/getAllBoardsList',function(req,res){
    Boards.find().sort({_id:-1}).populate('b_release').then(function(BoardsList){
        responData.message = '请求公告数据成功！';
        responData.BoardsList = BoardsList;
        res.json(responData);
    })
})
//获取某个item公告的信息
router.post('/boards/getItemBoardsInfo',function(req,res){
    var item = req.body.item;
    console.log(item);
    Boards.find({
        item:item
    }).sort({_id:-1}).populate('b_release').then(function(b_info){
        console.log("--------------------------");
        console.log(b_info);
        responData.message = '请求'+item+'公告数据成功！';
        responData.BoardsList = b_info;
        res.json(responData);
    })
})
//获取单个 公告的信息 和添加浏览量
router.get('/boards/getOneBoardinfo',function(req,res){
    var id=req.query.id || '';
    console.log(id);
    Boards.findOne({
        _id:id
    }).populate('b_release').then(function(info){
        info.views++;
        return info.save();
    }).then(function(newInfo){
        console.log(newInfo);
        responData.message = '获取单个公告信息成功！';
        responData.newInfo = newInfo;
        res.json(responData);
    })
    
})
//删除自己发的item
router.get('/boards/delete',function(req,res){
    var id=req.query.id || '';
    console.log(id);
    Boards.remove({
        _id:id
    }).then(function(){
        responData.message = '删除成功！';
        res.json(responData);
    })
    
})
//评论提交

router.post('/boards/comment/post',function(req,res){
    var b_Id = req.body.b_Id || '';
    var postData = {
        username:req.userInfo.username,
        postTime:new Date(),
        content:req.body.messageContent
    };
    Boards.findOne({
        _id:b_Id
    }).then(function(content){
        content.comments.unshift(postData);
        return content.save();
    }).then(function(newContent){
        responData.message = '评论成功！';
        responData.newContent = newContent;
        res.json(responData);
    })

})
//删除自己的评论
router.post('/boards/comment/delete',function(req,res){
    var c = req.body.c || '';
    var b_Id = req.body.b_Id || '';
    c.postTime =new Date(c.postTime)
    Boards.findOne({
        _id:b_Id
    }).then(function(content){
        var length = content.comments.length;
        console.log(length,"555555555555555555555555");
        console.log(c)
        console.log("11111111111111111111")
        console.log(content.comments[0])
        console.log(c == content.comments[0],"ok???")
        console.log( content.comments[0].postTime.toString() == c.postTime.toString())
        for (var i = 0; i < length; i++) {
            if (
                content.comments[i].postTime.toString() == c.postTime.toString()
                ) {
                if (i == 0) {
                    console.log("0000000000")
                    content.comments.shift(); //删除并返回数组的第一个元素
                    return content.save();
                }
                else if (i == length - 1) {
                    console.log("11111")
                    content.comments.pop();  //删除并返回数组的最后一个元素
                    return content.save();
                }
                else {
                    console.log("endendende")
                    content.comments.splice(i, 1); //删除下标为i的元素
                    return content.save();
                }
            }
        }
    }).then(function(newContent){
        console.log("-----------------")
        console.log(newContent);
        responData.message = '删除评论成功！';
        responData.newContent = newContent;
        res.json(responData);
    })

})
//加好友请求
router.get('/user/FriendRequest',function(req,res){
    var to_user = req.query.to_id;
    var from_user = req.userInfo._id;
    console.log(to_user+"---"+from_user);

    new Hails({
        from_user,
        to_user
    }).save().then(function(Hailsinfo){
        return Hails.find({from_user}).populate(['from_user','to_user']);
    }).then(function(Info){
        responData.message = '好友申请成功！';
        responData.Hailsinfo = Info;
        res.json(responData);
        return;
    })
})
//请求自己的所有好友情况
router.get('/user/getAllHailsInfo',function(req,res){
    Hails.find({from_user : req.userInfo._id}).populate(['from_user','to_user']).then(function(Info){
        responData.Hailsinfo = Info;
        res.json(responData);
        return;
    })
})
//同意好友请求
router.get('/user/FriendRequestAgree',function(req,res){
    
})
//请求好友列表
module.exports = router;