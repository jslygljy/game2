
//$(document).ready(function () {
//    gm_getAwardList(gameinit);
//    //var prizeArr = gm_getAwardList(); // 1,2,3对应1,2,3等奖，0标表示再接再厉   
//});

function gameinit(prizeArr) {
    var PRIZE_RESULT_NUM = 4; //谢谢惠顾 一等奖，二等奖，三等将
    var TOTAL_NUM = 5; //
    function toRem(val) {
        return parseInt(val / 64 * parseFloat($('html').css('font-size')), 10);
    }

    function getPrizeIndex() {
        //后台获取随机数    
        var num = prizeArr[Math.floor(Math.random() * prizeArr.length)];       
        return num;

        //var result = Math.floor(Math.random() * TOTAL_NUM);
        //if (result >= PRIZE_RESULT_NUM) {
        //    result = 0; // 谢谢惠顾
        //}
        //return result;
    }
   
    var prizeIndex = getPrizeIndex();
    // 需要在服务器中打开，否则插件会跨域报错 Uncaught SecurityError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.
    $(".game__scratch-area").wScratchPad({
        cursor: '',
        image: '../assets/image/scratch/' + prizeIndex + '.png',
        image2: '../assets/image/scratch/scratch_area.png',//刮奖背景
        width: toRem(444),
        height: toRem(75),
        realtimePercent: true, //You must add this attribute, or can not trigger the binding events
        scratchMove: function (e, percent) {
            if (percent > 50) {
                this.clear(); // 把剩余的挂完
            }
            if (percent === 100) {
                postToServer(prizeIndex + '');// 会被执行很多次
            }
        }
    });


    function postToServer(rewardCode) {
        postToServer = $.noop;//为了让该函数只执行一次      
        gm_submitGameResult(rewardCode);
    }
};