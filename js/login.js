/**
 * Created by admin on 2017/12/11.
 */
var record = {
        dateTime:null,
        count:0,
        code:"",
        countIncrease:function() {
                this.count == ++this.count;
        },
        init:function () {
                this.dateTime = null;
                this.count = 0;
                this.code = "";
        }
};

var lockLoginName = "";

$.validator.setDefaults({
        submitHandler: function () {
                register();
        }
});

$(document).ready(function () {
        //alert(server.serverName);
        $("#registForm").validate({
                // 错误插入位置，以及插入的内容
                errorPlacement: function(error,element) {
                        $(element).parent().after(error);
                },
                rules: {
                    email: {
                            required: true,
                            email: true
                    },
                    mobile: {
                            required: true,
                            number: true,
                            rangelength: [11, 11]
                    },
                    loginName: {
                            required: true,
                            rangelength: [4, 20]
                    },
                    loginPass: {
                            required: true,
                            rangelength: [6, 10]
                    },
                    repeatPass: {
                            required: true,
                            rangelength: [6, 10]
                    },
                    agree: "required"
                },
                messages: {
                        loginName: {
                                required: "请输入用户名",
                                rangelength: "用户名至少由4个字符组成,最多由20个字符组成"
                        },
                        loginPass: {
                                required: "请输入密码",
                                rangelength: "用户密码至少由6个字符组成,最多由10个字符组成"
                        },
                        repeatPass: {
                                required: "请输入密码",
                                rangelength: "用户密码至少由6个字符组成,最多由10个字符组成",
                                equalTo: "两次密码输入不一致"
                        },
                        mobile: {
                                required:"请输入手机号码",
                                number:"请输入正确的手机号码",
                                rangelength:"请输入正确的手机号码"
                        },
                        email: "请输入一个正确的邮箱",
                        agree: "请接受我们的用户协议",
                },

                //单条校验失败，后会调用此方法，在此方法中，编写错误消息如何显示 及  校验失败回调方法
                showErrors : function(errorMap, errorList) {
                        // 遍历错误列表
                        if(!empty(errorMap.loginPass)){
                                passErrHandler();
                        }
                        // 此处注意，一定要调用默认方法，这样保证提示消息的默认效果
                        this.defaultShowErrors();
                },
        })

        $("#login").click(function () {
                var loginName = $("#loginName").val();
                if(lockLoginName == loginName){
                        return error("该账号已经被锁定！");
                }
                $(this).attr("disabled", true);

                if (empty(loginName)) {
                        return error("账号不能为空");
                }
                var loginPass = $("#loginPass").val();
                if (empty(loginPass)) {
                        return error("密码不能为空");
                }
                var AuthorCode = "";
                if (record.count >= 3){
                        AuthorCode = $('#authorCode').val();
                        if(record.code != AuthorCode){
                                return error("验证码不正确");
                        }
                }
                var reqmap = {
                        LoginName: loginName,
                        LoginPwd: loginPass,
                }
                if(AuthorCode != ""){
                        reqmap.AuthorCode = AuthorCode;
                }
                ajaxPost('/login', reqmap, loginHandler);
        });

        $('#getCode').click(function () {
                requestNo = randomNum(20);;
                var result = ajaxPost('/getCode', requestNo, getCodeSuccess);
        });

        $('#reset').click(
            function () {
                    $("#registForm :input").not(":button, :submit, :reset, :hidden").val("").removeAttr("checked").remove("selected");
            }
        );

});

function showCode() {
        $('#codePanel').removeClass("code")
}

function passErrHandler() {

        if (record.count == 0){
                setRecord();
        }else {
                if (InTenMinte){
                        if(record.count >= 3){
                                showCode();
                        }
                }
                if(InLockMinte){
                        if(record.count >= 6){
                                lockCoustomer();
                        }
                }
                record.countIncrease();
        }
}

function lockCoustomer() {
        var loginName = $("#loginName").val();
        ajaxPost("/lockCus", loginName, lockResult);
}

function lockResult(result) {
        if(result.code == '0000'){
                alert("该用户被锁定，请30分钟之后再试！");
        }else {
                alert("系统异常，请联系管理员疼。");
        }
}

function InTenMinte() {
        var current = new Date().getTime();
        var original = record.dateTime;
        if(current - original > 10 * 60 * 1000){
                return false;
        }
        return true;
}

function InLockMinte() {
        var current = new Date().getTime();
        var original = record.dateTime;
        if(current - original < 20 * 60 * 1000){
                return false;
        }
        return true;
}

function setRecord() {
        if (empty(record.dateTime)){
                record.dateTime = new Date().getTime();
                record.count = 1;
        }
}


function setCockies() {
        /*var date=new Date();
                                date.setTime(date.getTime()+30*60*1000); //设置date为当前时间+30分
                                document.cookie="key=value; expires="+date.toGMTString(); */
        var current = new Date();
        current.setTime(date.getTime() + 10*60*1000);
        $.cookie('errorTimes', 1,  {
                path : '/',//cookie的作用域
                expires : current
        });
}

function loginHandler(result) {
        $("#login").removeAttrs("disabled");
        if(result.code == '0000'){
                record.init();
                console.log(JSON.stringify(result.data));
                loginSuccess(result.data);
        }
        else if(result.code == passErr){
                passErrHandler();
                alert(result.msg);
        }
        else {
                alert(result.msg);
        }
}

function loginSuccess(data) {
        jumpTo("/competition/welcome.html", JSON.stringify(data))
}

function randomNum(n){
        return Math.floor(Math.random()*n+1)-1;
}


function getCodeSuccess(result) {
        record.code  = result.data;
        alert("您的验证码是：【" + result.data + "】");
        //验证码发送成功
        var expireTime = 60;
        $("#getCode").text(expireTime + "s");
        $("#getCode").css({
                cursor: "none"
        });
        $("#getCode").attr("disabled", false);
        var x = expireTime - 1;
        var time = setInterval(function() {
                if (x) {
                        $("#getCode").text(x-- + "s");
                } else {
                        clearInterval(time);

                        $("#getCode").text("发送验证码");
                        $("#getCode").attr("disabled", true);
                }
        }, 1000);
}

function register() {
        var reqmap = new Object();
        reqmap.LoginName = $("#registerLoginName").val();
        reqmap.loginPwd = $("#registerloginPass").val();
        reqmap.email = $("#email").val();
        reqmap.mobile = $("#mobile").val();
        
        ajaxPost("/registed", reqmap, reisterSuccess);
}

function reisterSuccess(result) {
        console.log(JSON.stringify(result));
        if(result.code == "0000"){
                alert("注册成功！请您登陆。");
                $("#registForm :input").not(":button, :submit, :reset, :hidden").val("").removeAttr("checked").remove("selected");
                show_box('login-box');
        }
        else {
                alert(result.msg);
        }
}
/**
 * 空校验
 * @param exp
 * @returns {Boolean}
 */
function empty(exp) {
        if (exp && typeof (exp) == "undefined" || $.trim(exp) === "" || exp == "null" || exp === null) {
                return true;
        }
        return false;
}

function error(msg) {
        $(this).removeAttrs("disabled");
        $('.space .error').addClass('showError').text(msg);
        return false;
}

/**
 * ajax post请求
 * @param url url地址
 * @param reqMap 请求参数
 * @return {RetMsg}
 */
function ajaxPost(url, reqMap, fn) {
        $.ajax({
                url: server.doMainName + url,
                type: "POST",
                dataType: "json",
                async: false,
                contentType: 'application/json',
                data: JSON.stringify(reqMap),
                success: function (result) {

                        var re =  JSON.stringify(result);
                        console.log(re);
                        fn(result);
                },
                error:function (data) {
                        alert("接口调用失败，请检查网络!");
                        console.log(JSON.stringify(data));
                        window.location.reload();
                }
        });
}

function ajaxNoParamsPost(url, fn) {
        console.log(server.doMainName + url);
        $.ajax({
                url: server.doMainName + url,
                type: "POST",
                async: false,
                success: function (result) {
                        console.log(JSON.stringify(result));
                        if(result.code == '0000'){
                                fn(result);
                        }else {
                                alert(result.msg);
                        }


                },
                error:function (data) {
                        alert("接口调用失败，请检查网络!");
                        console.log(JSON.stringify(data));
                }
        });
}