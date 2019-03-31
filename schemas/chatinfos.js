var mongoose=require('mongoose');
//好友聊天表结构
module.exports = new mongoose.Schema({
    my:{//发送的人
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    he:{//接受的人
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    comments:{//聊天记录
        type:Array,
        default:[]
    },
});