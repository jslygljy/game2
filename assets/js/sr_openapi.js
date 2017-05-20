//初始化
var WeiAppInfo = {
    BaseUrlPath: "",
    WeiBasePath: "",
    RegPath: "/Template/Cust/Register.html?openid={openid}&state={wcid}",
    SkinUrl: "",
    LoginInfo: {
        AccountID: "",
        AccountName: "",
        WeiAppID: "",
        WechatID: "",
        OpenID: "",
        CustID: "",
        ShopID: ""
    },
    ShopInfo: {},
    UserRole: 0,//用户角色 0：未关注，1：已关注，2：已注册，3：已注册，被禁用
    ShowImgPath: function (imgid) {
        return this.BaseUrlPath + "/ShowImg/" + imgid;
    },
    SetData: function (accid, accname) {
        sessionStorage.getItem("weiapp_accid");
        sessionStorage.getItem("weiapp_accname");
        this.AccountID = accid;
        this.AccountName = accname;
    },
    SetOpenID: function (openid) {
        sessionStorage.getItem("weiapp_openid");
        this.OpenID = openid;
    },
    GetOpenID: function () {
        this.OpenID = sessionStorage.getItem("weiapp_openid");
        return this.OpenID;
    },
    SavaLoginInfo: function () {
        var sjson = JSON.stringify(this.LoginInfo);
        //if (typeof (json) == "object") {
        //    sjson = JSON.stringify(json);
        //}
        //else {
        //    sjson = json;
        //}
        sessionStorage.setItem("weiapp_logininfo", sjson);
    },
    RemoveLoginInfo: function () {
        sessionStorage.removeItem("weiapp_logininfo");
    },
    GetLoginInfo: function () {
        var logininfo = sessionStorage.getItem("weiapp_logininfo");
        if (logininfo != null && logininfo != '') {
            var sjson = JSON.parse(logininfo);
            this.LoginInfo = sjson;
            return sjson;
        }
        return null;
    }
};

/*
 * 依赖js：config.js,sr_common.js
 * 
 */
$sr_openapi = {
    /*
     * 用户验证
     * 1、判断是否有url 是否有openid，与wcid；
     * 2、验证oauth2，成功换取openid，与wcid
     * 3、获取缓存数据，无数据则退出；
     * @type undefined或null或1，不请求SR会员数据，2：请求SR会员数据
     * @autoregion:是否自动跳转注册页，0：不跳，1或其他：跳
     */
    getUserInfo: function (callback, type, autoregion) {
        //oauth2
        //1.看看有没有code,如果有,则换取openid
        var code = getUrlParam("code");
        var wcid = getUrlParam("wcid");
        var accid = getUrlParam("accid");
        var openid = getUrlParam("openid");
    
        if (wcid == null) {
            wcid = getUrlParam("state");
        }

        // alert(code + ' ' + wcid);

        //通过openid获取SR用户信息
        var getUserInfoByOpenID = function () {
            if (wcid != null) {
                WeiAppInfo.LoginInfo.WechatID = wcid;
            }
            WeiAppInfo.SavaLoginInfo();
            if (type != 2) {
                callback(WeiAppInfo.LoginInfo);
                return;
            }
            if (WeiAppInfo.LoginInfo.OpenID == undefined || WeiAppInfo.LoginInfo.OpenID == null || WeiAppInfo.LoginInfo.OpenID == '') {
                callback(WeiAppInfo.LoginInfo);
                return;
            }
            WeiAppInfo.UserRole = 1;
            $sr_openapi.getCustInfo(autoregion, callback);
        };

        var defaultReturn = function () {
            //3.先看看有没有缓存数据,有的话直接   
            var logininfo = WeiAppInfo.GetLoginInfo();
            callback(logininfo);
        };

        //1.首先取url openid 如果有重新加载数据  
        if (openid != null && openid != '') {
            WeiAppInfo.LoginInfo.OpenID = openid;
            //sessionStorage.setItem("openid", openid);
            getUserInfoByOpenID();
            return;
        }
        //2
        if (code != null) {
            $.post(WeiAppInfo.BaseUrlPath + "/api/Customer/GetOpenIdByCode/" + code + "/" + wcid, null, function (data) {
                if (data != null && data != '' && data != 'null') {
                    WeiAppInfo.UserRole = 1;
                    WeiAppInfo.LoginInfo.OpenID = data;
                }
                else {
                    var logininfo = WeiAppInfo.GetLoginInfo();
                }
                getUserInfoByOpenID();
            });
            return;
        };

        defaultReturn();
    },
    /*
     * 获取微小站信息
     */
    getWebInfo: function (callback) {
        //debugger;
        var accid = getUrlParam("accid");
        var wcid = getUrlParam("wcid");
        var websiteid = getUrlParam("websiteid");

        if (wcid == null) {
            wcid = getUrlParam("state");
        }
        var url = WeiAppInfo.WeiBasePath + "/api/weiapp/GetWeiWebInfoByAccID/" + accid;
        if (wcid != null) {
            url = WeiAppInfo.WeiBasePath + "/api/weiapp/GetWeiWebInfoByWcID/" + wcid;
        }

        if (websiteid != null) {
            url = WeiAppInfo.WeiBasePath + "/api/weiapp/GetWebSiteInfoByID/" + websiteid;
        }


        var shopinfo = {};
        var urlstr = window.location.href;
        WeiAppInfo.WeiBasePath = urlstr.substring(0, urlstr.indexOf('/', 9));
        WeiAppInfo.BaseUrlPath = WeiAppInfo.WeiBasePath;
        //WeiAppInfo.LoginInfo.AccountID = WeiAppInfo.AccountID;
        $.ajax({
            url: url,
            type: "get",
            dataType: "json",
            async: false,
            success: function (data) {
                WeiAppInfo.ShopInfo = data;
                WeiAppInfo.SkinUrl = data.UrlPath;
                WeiAppInfo.LoginInfo.WechatID = data.WechatID;
                WeiAppInfo.LoginInfo.AccountID = data.AccountID;

                WeiAppInfo.SavaLoginInfo();
                if (callback != undefined) {
                    callback();
                }
            },
            error: function (data) {
                //alert(data);
            }
        });
    },
    /*
     * 获取会员信息
     *  @autoregion:是否自动跳转注册页，0：不跳，1或其他：跳
     */
    getCustInfo: function (autoregion, callback) {
        var openid = WeiAppInfo.LoginInfo.OpenID;
        var url = WeiAppInfo.BaseUrlPath + "/api/customer/CustomerGetByOpenid/" + openid;
        $.ajax({
            url: url,
            type: "get",
            dataType: "json",
            async: false,
            cache: false,
            success: function (data) {
                if (data == undefined || data == null || data == '' || data == "[]" || data.Innerid == null) {
                    if (autoregion == 0) {
                        callback(null);
                    }
                    else {
                        window.location.href = WeiAppInfo.BaseUrlPath + WeiAppInfo.RegPath.replace("{openid}", WeiAppInfo.LoginInfo.OpenID).replace("{wcid}", WeiAppInfo.LoginInfo.WechatID);
                        callback(null);
                    }
                }
                else {
                    WeiAppInfo.UserRole = 2;
                    if (data.StatusCode != 1) {
                        WeiAppInfo.UserRole = 3;
                    }
                    WeiAppInfo.LoginInfo.CustID = data.Innerid;
                    callback(data);
                }
            },
            error: function (data) {
                callback(null);
            }
        });
    }
};