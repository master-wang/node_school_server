$(function(){
    
    //提交评论
    var comments 
    $('#messageBtn').on('click',function(){
        $.ajax({
            type:'post',
            url:'/api/comment/post',
            data:{
                contentId:$('#contentId').val(),
                messageContent:$('#messageContent').val()
            },
            dataType:'json',
            success:function(result){
                $('#messageContent').val('');
                comments = result.data.comments.reverse();
                renderComment();
            }
        });
    })
    //分页
    var parerPage=2;
    var page = 1;
    var pages = 0;
   

    $.ajax({
        url:'/api/comment',
        data:{
            contentId:$('#contentId').val()
        },
        dataType:'json',
        success:function(result){
            comments = result.data.comments.reverse();
            renderComment();
        }
    });

    $('.pager ').delegate('a','click',function(){
        if($(this).parent().hasClass('previous')){
            page--;
        }else{
            page++;
        }
        renderComment();
    })
    function renderComment(){
        $('#messageCount').html(comments.length);
        pages = Math.ceil(comments.length / parerPage);
        var start = (page-1)*parerPage;
        var end = start+parerPage;
        var lis = $('.pager li');
        lis.eq(1).html(page + '/'+pages);
        if(page<=1){
            page=1;
            lis.eq(0).html("没有上一页了");
        }else{
            lis.eq(0).html('<a href="javascript:;">上一页</a>');
        }
        if(page>=pages){
            page=pages;
            lis.eq(2).html("没有下一页了");
        }else{
            lis.eq(2).html('<a href="javascript:;">下一页</a>');
        }
        if(end>=comments.length){
            end=comments.length
        }

        var html=``;
        for(var i = start;i<end;i++){
            html+=`
            <p class="name clear">
                <span class="fl">${comments[i].username}</span><span class="fl">${formateData(comments[i].postTime)}</span>
            </p>
            <p class="name clear">
                ${comments[i].content}
            </p>
            `
        }
        $('#commentsList').html(html);
    }

    function formateData(d){
        var date = new Date(d);
        return date.getFullYear()+'年'+date.getMonth()+'月'+date.getDate()+'时'+date.getHours() +':'+date.getMinutes()+':'+date.getSeconds();
    }

    //页面的 vue 的实例
    var index = {
        template : `
            <div>
                <h1>首页</h1>
                <h3> 欢迎来到西邮娱乐之家</h3>
                <img  src="/public/imgs/index.jpeg" alt="" style="width:800px;">
                <h4>在这里你会找到你想要的，加入我们吧！</h4>
                
            </div>
            
        `
    }
    var schoolFriends={
        template : `
            <div>
                <h1>schoolFriends</h1>
            </div>
            
        `
    }
    var boardShow={
        template : `
            <div>
                <h1>boardShow</h1>
                <div>
                    公告展示
                </div>
            </div>
        `
    }
    var boardAdd={
        template : `
            <div>
                <h1>发布我的公告</h1>
                <div>
                    <label for="">
                        公告类别：<select name="" v-model="boardInfo.item"  class="form-control">
                                <option value="找情侣">找情侣</option>
                                <option value="买卖物品">买卖物品</option>
                                <option value="约一起看电影">约一起看电影</option>
                                <option value="约一起学习">约一起学习</option>
                                <option value="表白墙">表白墙</option>
                                <option value="兼职墙">兼职墙</option>
                            </select>
                    </label> 
                    <br />
                    <label for="">
                        主题：<input  v-model="boardInfo.b_theme"  type="text" class="form-control" placeholder="主题">
                    </label>
                    <br />
                    <label for="">
                        描述：<input  v-model="boardInfo.b_disc"  type="text" class="form-control" placeholder="描述">
                    </label>
                    <br />
                    <label for="exampleInputFile">头像
                            <input type="file" name="file" id="updateBoard_imgs" accept="image/gif, image/jpeg,image/png,image/jpg" multiple>
                            <img src="" height="100px;width:100px">
                        <p class="help-block">最多三张图片</p>
                    </label>
                </div>
                <div>
                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="post_boardInfo()">发布</button>
                </div>
            </div>
            
        `,
        data:function(){
            return {
                boardInfo:{
                    item:'表白墙',
                    b_theme:'',
                    b_disc:'',
                    _id:''
                }
            }
        },
        methods:{
            post_boardInfo(){
                this.userInfo=JSON.parse(localStorage.getItem('userInfo'));
                this.boardInfo._id=this.userInfo._id.toString();
                var that=this;
                let x = document.getElementById('updateBoard_imgs').files[0];
                console.log(x);
                if(this.boardInfo.b_theme==''||this.boardInfo.b_disc==''){
                    alert("主题和描述不能为空！");
                }else{
                    if(!x){
                        console.log("未选择头像");
                        $.ajax({
                            type:'post',
                            url:'/api/boards/addInfo',
                            data:that.boardInfo,
                            dataType:'json',
                            success:function(result){
                                var Boardinfo_Id = result.Boardinfo_Id;
                                that.post_boardInfoImg();
                            }
                        });
                    }else{
                        $.ajax({
                            type:'post',
                            url:'/api/user/UpateInfo',
                            data:that.update_userInfo,
                            dataType:'json',
                            success:function(result){
                                console.log("ready img");
                                console.log(result);
                                that.post_boardInfoImg();
                            }
                        });
                    }
                }
                
            },
            post_boardInfoImg(){
                var that=this;
                let x = document.getElementById('updateBoard_imgs').files[0];
                let params = new FormData() ; //创建一个form对象
                params.append('file',x,x.name);  //append 向form表单添加数据
                console.log(params);
                $.ajax({
                    type:'post',
                    url:'/api/boards/addInfoImg',
                    data:params,
                    dataType: 'JSON',  
                    cache: false,  
                    processData: false,  //不处理发送的数据，因为data值是FormData对象，不需要对数据做处理 
                    contentType: false,
                    success:function(result){
                        console.log(result);
                        localStorage.setItem('userInfo',JSON.stringify(result.userInfo));
                        vm.userInfo=result.userInfo;
                        that.$router.push({
                            path: '/successInfo',
                            query: {
                              "msg":"更新个人资料成功！"
                            }
                          })
                    }
                });
            }
        }
    }
    var scgoolBoard={
        template : `
            <div>
                <div class="list">
                    <div class="list_mid">
                    <ul>
                    <li  @click="color_stasus='公告展示'" ><router-link to='/scgoolBoard/boardShow' :class="{check:color_stasus==='公告展示'}">公告展示</router-link></li>
                    <li  @click="color_stasus='发布公告'" ><router-link to='/scgoolBoard/boardAdd' :class="{check:color_stasus==='发布公告'}">发布公告</router-link></li>
                    </ul>
                    </div>
                </div>
                <router-view></router-view>
            </div>
        `,
        data:function(){
            return {
                color_stasus:'公告展示'
            }
        }
    }
    var errorInfo ={
        template : `
        <div>
            <h1>出错！</h1>
            <h2>{{$route.query.msg}}</h2>
        </div>
        
        `
    }
    var successInfo ={
        template : `
        <div>
            <h1>{{$route.query.msg}}</h1>
        </div>
        
        `
    }
    var updateUserInfo={
        template : `
            <div>
                <h1>完善个人信息</h1>
                <div>
                    
                    <br />
                    <label for="">
                        昵称：<input v-model="update_userInfo.nicheng" type="text" class="form-control" placeholder="昵称：">
                    </label>
                    <br />
                    <label for="">
                        性别：<select name=""   v-model="update_userInfo.sex"  class="form-control">
                                <option value="男">男</option>
                                <option value="女">女</option>
                            </select>
                    </label> 
                    <br />
                    <label for="">
                        描述：<input v-model="update_userInfo.disc" type="text" class="form-control" placeholder="描述">
                    </label>
                    <br />
                    <label for="">
                        院系<select name=""   v-model="update_userInfo.faculty"  class="form-control">
                                <option value="计院">计院</option>
                                <option value="通院">通院</option>
                                <option value="电院">电院</option>
                                <option value="理学院">理学院</option>
                                <option value="数媒">数媒</option>
                            </select>
                    </label> 
                    <br />
                    <label for="">
                        班级：<input v-model="update_userInfo.Class" type="text" class="form-control" placeholder="输入班级">
                    </label>
                    <br />
                    <label for="exampleInputFile">头像
                            <input @change="obvies_touxiang" type="file" name="photo" id="updateUser_touxiang" accept="image/gif, image/jpeg,image/png,image/jpg" >
                            <img src="" height="100px;width:100px">
                        <p class="help-block">不传头像会默认头像</p>
                    </label>
                </div>
                <div>
                    <button type="button" class="btn btn-default" data-dismiss="modal" @click="go_back_router()">Close</button>
                    <button type="button" class="btn btn-primary" @click="post_updateUserInfo()">确定修改</button>
                </div>
            </div>
            
        `,
        data:function(){
            return {
                update_userInfo:{
                    "nicheng":'',
                    "sex":'男',
                    "disc":'',
                    "faculty":'计院',
                    "Class":'',
                    "_id":''
                }
            }
        },
        methods:{
            //返回上一层
            go_back_router(){
                this.$router.go(-1);
            },
            //更新个人信息
            post_updateUserInfo(){
                this.userInfo=JSON.parse(localStorage.getItem('userInfo'));
                this.update_userInfo._id=this.userInfo._id.toString();
                var that=this;
                let x = document.getElementById('updateUser_touxiang').files[0];
                console.log(x);
                if(!x){
                    alert("未选择头像");
                }else{
                    $.ajax({
                        type:'post',
                        url:'/api/user/UpateInfo',
                        data:that.update_userInfo,
                        dataType:'json',
                        success:function(result){
                            console.log(result);
                            that.post_updateUserInfo_img();
                        }
                    });
                }
                
            },
            //更新的人信息的头像
            post_updateUserInfo_img(){
                var that=this;
                let x = document.getElementById('updateUser_touxiang').files[0];
                let params = new FormData() ; //创建一个form对象
                params.append('photo',x,x.name);  //append 向form表单添加数据
                console.log(params);
                $.ajax({
                    type:'post',
                    url:'/api/user/UpateInfoImg',
                    data:params,
                    dataType: 'JSON',  
                    cache: false,  
                    processData: false,  //不处理发送的数据，因为data值是FormData对象，不需要对数据做处理 
                    contentType: false,
                    success:function(result){
                        console.log(result);
                        localStorage.setItem('userInfo',JSON.stringify(result.userInfo));
                        vm.userInfo=result.userInfo;
                        that.$router.push({
                            path: '/successInfo',
                            query: {
                              "msg":"更新个人资料成功！"
                            }
                          })
                    }
                });
            },
            obvies_touxiang(i){
                 $("[name='photo']").siblings('img').attr('src',URL.createObjectURL($("#updateUser_touxiang")[0].files[0])); 
            }
        }
    }
    //路由
    var routes = [
        {
            path : '/',
            component : index

        },
        {
            path : '/errorInfo',
            component : errorInfo

        },
        {
            path : '/successInfo',
            component : successInfo

        },
        {
            path : '/scgoolBoard',
            component :scgoolBoard ,
            children:[
                {
                    path : '/scgoolBoard/boardShow',
                    component : boardShow
        
                },
                {
                    path : '/scgoolBoard/boardAdd',
                    component : boardAdd
        
                },
            ]

        },
        {
            path : '/schoolFriends',
            component : schoolFriends

        },
        {
            path : '/updateUserInfo',
            component : updateUserInfo

        },
        {
            path : '/user/:id',
            name:'user',
            component : {
                template : 
                // <router-link to='/user' append>更多信息</router-link>
                `
                    <div>
                        <h1>用户:{{$route.params.id}}</h1>
                        <h1>用户:{{$route.query.age}}</h1>
                        <router-link :to="'/user/'+$route.params.id+'/more?age=18'">更多信息</router-link>
                    
                        
                        <router-view></router-view>
                    </div>
                `
            },
            children:[
                {
                    path:'more',
                    component : {
                    template : `
                    <div>
                        <h1>dffgf dsg dgdgdggdgddddddddddddddddddddddd dddddddddddddd</h1>
                    </div>
                `
                    }
                }
            ]

        }
    ];

    var router = new VueRouter({
        routes:routes,
    });
    var vm=new Vue({
        delimiters: ['${', '}'],
        el:'#app',
        router:router,
        data:{
            up_down:true,
            mark:0,
            timer:null,
            color_stasus:'index',
            login_stadus:'login',
            roundImgs:['/public/imgs/01.jpeg','/public/imgs/02.jpeg','/public/imgs/03.jpeg','/public/imgs/04.jpeg','/public/imgs/05.jpeg'],
            userInfo:{},
            register_userInfo:{
                username:'',
                password:'',
                repassword:''
            },
            login_userInfo:{
                username:'',
                password:'',
            },
            register_tip:'',
            login_tip:'',
            loginOut_tip:''
        },
        methods: {
            //让页面上移动特效
            up_or_down(){
                console.log(this.up_down);
                if(this.up_down){
                    $(".bottom").animate({top: '200px'}, "slow");
                    $(".up_down_img").eq(0).attr("src",'/public/imgs/down.png');
                    this.up_down=!this.up_down;
                }else{
                    $(".bottom").animate({top: '950px'}, "slow");
                    $(".up_down_img").eq(0).attr("src",'/public/imgs/up.png');
                    this.up_down=!this.up_down;
                }
            },
            //首页的轮播效果
            autoPlay () {
                this.mark++;
                if (this.mark === 4) {
                    this.mark = -1
                }
            },
            play () {
                this.timer = setInterval(this.autoPlay, 2500)
            },
            change (i) {
                this.mark = i
            },
            stop () {
                clearInterval(this.timer)
            },
            move () {
                this.timer = setInterval(this.autoPlay, 2500)
            },
            //主页换颜色 橙色选中
            cp_color(str){
                this.color_stasus=str;
            },
            //注册
            User_resister(){
                var registerBox = $('#registerBox');
                var that=this;
                $.ajax({
                    type:'post',
                    url:'/api/user/register',
                    data:that.register_userInfo,
                    dataType:'json',
                    success:function(result){
                        console.log(result)
                        that.register_tip=result.message;
                        if(!result.code){
                            setTimeout(function(){
                                that.login_stadus='login';
                            },1000);
                        }
                    }
                });
            },
            //登录
            User_login(){
                var that=this;
                $.ajax({
                    type:'post',
                    url:'/api/user/login',
                    data:that.login_userInfo,
                    dataType:'json',
                    success:function(result){
                        console.log(result);
                        that.login_tip=result.message;
                        that.userInfo=result.userInfo;
                        localStorage.setItem('userInfo',JSON.stringify(result.userInfo));
                        if(!result.code){
                            setTimeout(function(){
                                that.login_stadus='ok';
                                // window.location.reload();
                            },1000);
                        }
                    }
                });
            },
            //退出登录
            login_out(){
                var that=this;
                $.ajax({
                    type:'get',
                    url:'/api/user/logout',
                    success:function(result){
                        console.log(result);
                        that.loginOut_tip=result.message;
                        that.userInfo={};
                        localStorage.setItem('userInfo',null);
                        if(!result.code){
                            alert("退出登录成功！");
                            setTimeout(function(){
                                that.login_stadus='login';
                            },1000);
                        }
                        that.$router.push('/');
                    }
                });
            },
            //网页刷新 先获取本地存储的数据
            getuserInfo_bylocal(){
                this.userInfo=JSON.parse(localStorage.getItem('userInfo'));
                if(this.userInfo){
                    this.login_stadus='ok';
                }else{
                    this.login_stadus='login';
                }
            }
        },
        created(){
            var that=this;
            this.play();
            this.getuserInfo_bylocal();
            setTimeout(function(){
                that.up_or_down();
            },1000);
        }
    });
});