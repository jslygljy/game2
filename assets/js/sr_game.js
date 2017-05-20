/*
 * 游戏通用接口
 * 依赖：jquery.js
 */

/*
 * 游戏配置
 */
var GameConfig = {
    AccountID: "",
    CustID: "",
    OpenID: "",
    ApiUrl: "",
    CampaignID: "",
    ConfigJson: "",
    onInited: function () {

    },
    AwardList: []
};



/*
 * 获取配置
 */
function gm_getAwardList(callback) {
    var data = [{ ReturnCode: "1", DiffCoeff: 90 }
        , { ReturnCode: "2", DiffCoeff: 80 }
        , { ReturnCode: "3", DiffCoeff: 70 }
        , { ReturnCode: "4", DiffCoeff: 40 }];
    var gameid = getUrlParam("gameid");
    if (gameid == null) {
        gameid = getUrlParam("camid");
    }

    GameConfig.CampaignID = gameid;
    $.ajax({
        url: baseconfig.srapi + "/api/WeiApp/GetCampaignInfoByID/" ,
        type: "get",
        dataType: "json",
        async: false,
        success: function (data) {
            if (data != null) {
                $(".game").css({ visibility: "visible" });
                GameConfig.AwardList = data.AwardList;
                GameConfig.ApiUrl = baseconfig.srapi + data.ApiUrl;
                GameConfig.ConfigJson = data.ConfigJson;
                GameConfig.onInited();

                var result = getAwardsData(data.AwardList);
                callback(result);

            }
        },
        error: function (data) {
            callback([]);
        }
    });
   //callback([]);// todo 测试用

    //return [];
}

//获取奖励随机数组
function getAwardsData(_awardlist) {
    var AwardsData = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2];
    var a1 = 40;
    var a2 = 40;
    var a3 = 40;
    var a4 = 40;
    for (var i = 0; i < _awardlist.length; i++) {
        var code = _awardlist[i].ReturnCode;
        var diffcoeff = 100 - _awardlist[i].DiffCoeff;
        switch (code) {
            case "1":
                a1 = diffcoeff;
                break;
            case "2":
                a2 = diffcoeff;
                break;
            case "3":
                a3 = diffcoeff;
                break;
            case "4":
                a4 = diffcoeff;
                break;
            default:
                break;
        }
    }
    var totel = a1 + a2 + a3 + a4;
    if (totel <= 0) {
        totel = 1;
    }
    AwardsData = new Array();
    var i1 = (a1 / totel) * 20;
    var i2 = (a2 / totel) * 20;
    var i3 = (a3 / totel) * 20;
    var i0 = (a4 / totel) * 20;

    for (var i = 0; i < i1; i++) {
        AwardsData.push(1);
    }
    for (var i = 0; i < i2; i++) {
        AwardsData.push(2);
    }
    for (var i = 0; i < i3; i++) {
        AwardsData.push(3);
    }
    for (var i = 0; i < i0; i++) {
        AwardsData.push(4);
    }
    return AwardsData;
}
/*
 * 提交结果
 */
function gm_submitGameResult(reward_code) { 
    var openid = GameConfig.OpenID;
    if (openid == undefined || openid == null || openid == '') {
        puzzle.reload();
        alert(1);
        $ui.alert("请通过微信打开此游戏！");

        return;
    }
    var custid = GameConfig.CustID;
    if (custid == undefined || custid == null || custid == '') {
        $ui.alert("请到微信菜单注册会员或继续试玩！");
        return;
    }
    
    $.ajax({
        type: "post",
        url: GameConfig.ApiUrl,
        data: {
            "OpenID": GameConfig.OpenID,
            "CustID": GameConfig.CustID,
            "AwardCode": reward_code,
            "CampaignID": GameConfig.CampaignID
            //"CampaignID": "00000000-0000-0000-0000-000000000011"
        },
        success: function (data) {
            var obj = eval("(" + data + ")");
            //  var content = "<div>" + tip_info + "</div>";
            //   content += "<div class='success_confirm'><a href='javascript:void(0)' onclick='$.unblockUI()'>确定</a></div>";
            //  var timeout = 1000;
            //  var modal = true;
            //    createBlockDialog(content, timeout, modal);
            var res_content = obj.Message;
            var message_code = obj.MessageCode;
            if (message_code == "1") {
                res_content = obj.Message;
            }
            else if (message_code == "002") {
                res_content = "非活动时间";
            }
            else if (message_code == "006") {
                res_content = "请到菜单页注册会员或继续试玩";
            }
            else {
                res_content = obj.Message;
            }

            //res_content += "<div class='success_confirm'><a href='javascript:void(0)' onclick='$.unblockUI()'>确定</a></div>";
            //var timeout = 1000;
            //var modal = true;
            $ui.alert(res_content);
        },
        error: function () {
            return true;
        }
    });
}

/*
 * 生产随机数组
 */
function gm_randomarray(data) {
    var _array = [];
    if (data == undefined || data == null || data.length <= 0) {
        return [1, 2, 3, 0, 1, 2, 3, 0, 1, 2];
    } 
    var AwardList = data;
    var a1 = 40;
    var a2 = 40;
    var a3 = 40;
    var a4 = 40;
    for (var i = 0; i < AwardList.length; i++) {
        var code = AwardList[i].ReturnCode;
        var diffcoeff = 100 - AwardList[i].DiffCoeff;
        switch (code) {
            case "1":
                a1 = diffcoeff;
                break;
            case "2":
                a2 = diffcoeff;
                break;
            case "3":
                a3 = diffcoeff;
                break;
            case "4":
                a4 = diffcoeff;
                break;
            default:
                break;
        }
    }
    var totel = a1 + a2 + a3 + a4;
    if (totel <= 0) {
        totel = 1;
    }
    _array = new Array();
    var i1 = (a1 / totel) * 20;
    var i2 = (a2 / totel) * 20;
    var i3 = (a3 / totel) * 20;
    var i0 = (a4 / totel) * 20;

    for (var i = 0; i < i1; i++) {
        _array.push(1);
    }
    for (var i = 0; i < i2; i++) {
        _array.push(2);
    }
    for (var i = 0; i < i3; i++) {
        _array.push(3);
    }
    for (var i = 0; i < i0; i++) {
        _array.push(0);
    }
    return _array;  
}


//获取难度数组
function getDiffCoeffs(coeffs) {
    var strs = [200, 400, 600, 10000];
//    debugger;
    for (var i = 0; i < GameConfig.AwardList.length; i++) {
        var diff = 100 - GameConfig.AwardList[i].DiffCoeff;
        strs[i] = diff * coeffs;
    }
    return strs;
}

//$(function () {
 
//});
/*
  * 验证用户身份
  */
$sr_openapi.getUserInfo(function () {
    GameConfig.CustID = WeiAppInfo.LoginInfo.CustID;
    GameConfig.OpenID = WeiAppInfo.LoginInfo.OpenID;
    gm_getAwardList(gameinit);
}, 2, 0);