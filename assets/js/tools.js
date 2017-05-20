(function(win) {
    var tools = win.tools || {};
    tools.pxToRem = function(val, base) {
        base = base || 64; // 640px设计稿，分成10份
        return val / 64;
    };

    tools.outHTML = function($el) {
        var $wrap = $('<div>');
        return $wrap.append($el).html();
    };

    tools.supportTouchEvent = function() {
        return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
    };

    tools.getClickEventName = function() {
        var isSupportTouch = tools.supportTouchEvent();
        return isSupportTouch ? 'touchend' : 'click';
    }
    tools.queueCall = function(fn, time, ctx) {
        ctx = ctx || fn;
        time = time || 200;
        var argsArr = []; // 执行方法的队列
        setInterval(function() {
            if (argsArr.length === 0) {
                return;
            }
            var args = argsArr.shift();
            fn.apply(ctx, args);
        }, time);
        return function() {
            argsArr.push(arguments);
        };
    }
    tools.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg); //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }
    win.tools = tools;
})(window);
