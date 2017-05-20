
//游戏初始化配置
function gameinit(prizeArr) {
    var prizeAngle = { // 奖品对应转的角度
        '4': [15, 135, 195, 255, 315],
        '1': [345],
        '2': [285, 105],
        '3': [45, 75, 165]
    };
 
    function getPrizeInfo() {
        var prizeIndex = randomInArr(prizeArr);
        var randomAngle = randomInArr(prizeAngle[prizeIndex + '']);
        return {
            prizeCode: prizeIndex,
            angle: randomAngle
        }
    }

    function randomInArr(arr) {
        var index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    function rotate(angle, callback) {
        $(".game__rotate-area").rotate({
            angle: 0,
            duration: 5000,
            animateTo: angle + 360 * 4, //angle是图片上各奖项对
            callback: function () {
                callback && callback();
            }
        });
    }

    function afterRotate(prizeCode) {
        gm_submitGameResult(prizeCode);
    }

    function init() {
        $('html').height($(document).height());
        $('.game__rotate-btn').click(function () {
            var prizeInfo = getPrizeInfo();
            rotate(prizeInfo.angle, function () {
                afterRotate(prizeInfo.prizeCode);
            });
        });

    }
    init();
}

//$(document).ready(function () {
//    gm_getAwardList(gameinit);
//    //var prizeArr = gm_getAwardList(); // 1,2,3对应1,2,3等奖，0标表示再接再厉   
//});
