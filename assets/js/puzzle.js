//$(document).ready(function () {
//    gm_getAwardList(gameinit);
//    //var prizeArr = gm_getAwardList(); // 1,2,3对应1,2,3等奖，0标表示再接再厉   
//});

function gameinit(prizeArr) {
    var tools = window.tools;
    var pxToRem = tools.pxToRem;
    var outHTML = tools.outHTML;
    var getClickEventName = tools.getClickEventName;

    function Puzzle($el, param) {
        var defaultParam = {
            picUrl: '',
            picW: 500, // 图片尺寸
            picH: 500,
            // unit: 'rem',// 目前只支持rem
            row: 3,
            col: 3,
            itemClass: 'puzzle__item',
            passFn: $.noop(),
            onStartFn: $.noop()
        };
        if (param) {
            if (param.picW) {
                param.picW = parseInt(param.picW, 10);
            }
            if (param.picH) {
                param.picH = parseInt(param.picH, 10);
            }
        }
        this.param = $.extend({}, defaultParam, param);
        this.$el = $el;
        this.init();
    }

    Puzzle.prototype = {
        imgBasePath: '../assets/image/puzzle/',
        imgs: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg','6.jpg','7.jpg','8.jpg','9.jpg'],
        items: [],
        init: function () {
            this.initView();
            this.registerEvent();
        },
        initView: function (isReload) {
            this.locs = this.generatorLocs();
            this.items = this.makeItems(this.locs);
            var itemHTML = [];
            var i = 0;
            this.reduce(function (row, col) {
                itemHTML.push(outHTML(this.items[i++]));
            });
            this.$el.append(itemHTML.join(''));
            if (!isReload) {
                this.$el.after(this.makeGird());
            }
            this.$items = this.$el.find('.' + this.param.itemClass);
        },
        reload: function () {
            var self = this;
            clearTimeout(this.reloadId);
            setTimeout(function () {
                // self.$items.animate({
                //         opacity: 0.5
                //     },
                //     function() {
                //         self.$items.remove();
                //         self.initView(true);
                //     });

                self.$items.remove();
                self.initView(true);
            }, 100);
        },
        registerEvent: function () {
            var $wrap = this.$el;
            var itemSelector = '.' + this.param.itemClass;
            var itemSelecetedSelector = itemSelector + '--selected';
            var itemSelecetedClassName = this.param.itemClass + '--selected';
            var self = this;
            $wrap.on(getClickEventName(), itemSelector, function () {
                var $selectedItem = $wrap.find(itemSelecetedSelector);
                if ($selectedItem.length === 1) {
                    self.exchangeItem($selectedItem, $(this));
                    $selectedItem.removeClass(itemSelecetedClassName);
                } else {
                    $(this).addClass(itemSelecetedClassName);
                }
            });


            $('.rules__close-btn').on(getClickEventName(), function () {
                $.magnificPopup.close();
            })
        },
        exchangeItem: function ($one, $ano) {
            var oneOffset = $one.position();
            var anoOffset = $ano.position();
            var self = this;
            $one.animate({
                left: anoOffset.left,
                top: anoOffset.top
            }, function () {
                if (self.isPass()) {
                    self.param.passFn($.now() - self.startTime);
                }
            });
            $ano.animate({
                left: oneOffset.left,
                top: oneOffset.top
            });
        },
        makeItems: function (locs) { // 生成方块
            var random = Math.floor(this.imgs.length * Math.random());
            // var random = 0;
            var src = this.imgBasePath + this.imgs[random];
//            var self = this;
            $('.popup__img').attr('src', src);
            var self = this;
            $.magnificPopup.open({
                items: {
                    src: $('.popup'),
                    type: 'inline',
                    modal: true
                },
                showCloseBtn: false,
                callbacks: {
                    close: function () {
                        clearTimeout(self.hidePopId);
                        self.startTime = $.now();
                        self.param.onStartFn();
                    }
                }
            });
            clearTimeout(this.hidePopId);
            this.hidePopId = setTimeout(function () {
                $.magnificPopup.close();
            }, 5000);
            var i = 0;
            var items = this.reduce(function (row, col) {
                return this.makeItem(row, col, src, locs[i++]);
            });
            return items;
        },
        getGameStartTime: function(){
            return this.startTime;
        },
        makeItem: function (row, col, src, loc) { // 生成方块
            var $item = $('<div>');
            $item.attr('data-row-index', row)
                .attr('data-col-index', col)
                .css({
                    'background-image': 'url(' + src + ')',
                    left: loc.left,
                    top: loc.top
                })
                .addClass(this.param.itemClass);

            return $item;
        },
        generatorLocs: function () {
            var param = this.param;
            this.itemW = param.picW / param.col;
            this.itemH = param.picH / param.row;
            var locs = this.reduce(function (row, col) {
                return {
                    left: pxToRem(col * this.itemW) + 'rem',
                    top: pxToRem(row * this.itemH) + 'rem'
                };
            });
            locs.sort(function () {
                return Math.random() - 0.5;
            });
            return locs;
        },
        makeGird: function () { // 网格
            var rowLen = this.param.row;
            var colLen = this.param.col;
            var gridHtml = [];
            for (var row = 1; row < rowLen; row++) {
                gridHtml.push(this.makeLine(row, 'row'));
            }
            for (var col = 1; col < colLen; col++) {
                gridHtml.push(this.makeLine(col, 'col'));
            }
            return gridHtml.join('');
        },
        makeLine: function (index, type) {
            var $item = $('<div>');
            $item.addClass('puzzle__grid-item').addClass('puzzle__grid-item--' + type);
            var left = 0;
            var top = 0;
            if (type === 'row') {
                top = pxToRem(index * this.itemH) + 'rem';
            } else {
                left = pxToRem(index * this.itemW) + 'rem';
            }
            $item.css({
                left: left,
                top: top
            });

            return outHTML($item);
        },
        // 所有都满足 left比右边的元素小，top比下边元素小
        isPass: function () {
            var isPass = true;
            var $items = this.$items;
            var rowLen = this.param.row;
            var colLen = this.param.col;

            var self = this;
            $items.each(function () {
                var $this = $(this);
                var row = parseInt($this.data('row-index'), 10);
                var col = parseInt($this.data('col-index'), 10);
                var pos = $this.position();
                console.log('row:%d,col:%d', row, col);
                console.log('    left:%d,top:%d', pos.left, pos.top);
                if (row + 1 < rowLen) {
                    var nextRowOffset = $items.filter(self.generateIndexSel(row + 1, col)).position();
                    console.log('    row:%d,col:%d,left:%d,top:%d', row + 1, col, nextRowOffset.left, nextRowOffset.top);
                    if (nextRowOffset.top < pos.top) {
                        isPass = false;
                        return false;
                    }
                }
                if (col + 1 < colLen) {
                    var nextColOffset = $items.filter(self.generateIndexSel(row, col + 1)).position();
                    console.log('    row:%d,col:%d,left:%d,top:%d', row, col + 1, nextColOffset.left, nextColOffset.top);
                    if (nextColOffset.left < pos.left) {
                        isPass = false;
                        return false;
                    }
                }
                console.log('------------------------------');
            });
            return isPass;
        },
        generateIndexSel: function (row, col) {
            var template = '[data-row-index={row}][data-col-index={col}]';
            return template.replace('{row}', row).replace('{col}', col);
        },
        reduce: function (fn) { // 遍历每一个,生成结果
            if (!$.isFunction(fn)) {
                return;
            }
            var res = [];
            var rowLen = this.param.row;
            var colLen = this.param.col;
            for (var row = 0; row < rowLen; row++) {
                for (var col = 0; col < colLen; col++) {
                    res.push(fn.apply(this, [row, col]));
                }
            }
            return res;
        }
    };

    function init() {
        //$ui.alert('start');
        $('html').height($(document).height());


        var puzzle = new Puzzle($('.puzzle__content'), {
            row:3,
            col:3,
            passFn: onPass,
            onStartFn: function(){
                //
            }
        });


        // $('.change-btn').on(getClickEventName(), function() {
        $('.change-btn').on('click', function () {
            puzzle.reload();
        });

        $('#show-game-rule').magnificPopup({
            type: 'inline',
            showCloseBtn: false
        });

        // alert(tools.getUrlParam("OpenID"));
        window.onPass = onPass;

        /*var gameTimeArr = [10, 200];// 奖品时间控制
        gameTimeArr = gameTimeArr.map(function(each){
            return each * 1000;
        });
        var gameList = [

        ];*/

        function onPass(useTime) {
            var rewardName = "";
            var rewardCode = "0";

            var strs = getDiffCoeffs(1000);

            //WeiAppConfig.AwardList[0].
            /*if (useTime <= strs[0]) {
                reward_code = "1";
                reward_name = "一等奖";
            } else if (useTime > strs[0] && useTime <= strs[1]) {
                reward_code = "2";
                reward_name = "二等奖";
            } else if (useTime > strs[1] && useTime <= strs[2]) {
                reward_code = "3";
                reward_name = "三等奖";
            } else if (useTime > strs[2]) {
                reward_code = "0";
                reward_name = "谢谢惠顾";
            }*/


            var startTime = puzzle.getGameStartTime();
            var useTimeObj=parseInt(useTime / 1000);
            var endTime = startTime + useTime;
            var endTimeObj = new Date(endTime);
            var startTimeObj = new Date(startTime);
            $ui.alert('您一共用了' + useTimeObj +'秒!\n'+startTimeObj+endTimeObj, function () {
                gm_submitGameResult(rewardCode);
                $.ajax({
                    type:"post",
                    url:url,
                    data:{
                        "usetime":useTimeObj,
                        "startime":startTimeObj,
                        "endtime":endTimeObj
                    },
                    success:function(data){
                         $ui.alert(data);
                    }

                })
            });
                
        }
    }

    init();
}

///*
// * 1， 随机一张图片 2，把图片分成 x*y块，每一块有个标 data-row-index,data-col-index。生成所有块的left，top的值，打乱那数组
// *
// *
// */
//$(document).ready(function() {
   
//});
