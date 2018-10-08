var $ = function (o) { return document.getElementById(o); }

var canvas = $("canvas");
var context = canvas.getContext("2d");

//场景宽度
var stageWidth = 288;
//场景高度
var stageHeight = 512;

var imageAddress = ['images/atlas.png'];//需要加载的图像
var imageStart = [];//已加载好的图像
var imageId = 0;//当前加载的图像ID

//显示列表
var displayList = [];
//动画列表
var animeList = [];
//全局场景
var coreStage2d = null;
//事件
var EVENT_MOUSE_Click = "onclick";
var EVENT_MOUSE_Down = "onmousedown";
var EVENT_MOUSE_Up = "onmouseup";
var EVENT_MOUSE_Move = "onmousemove";
var EVENT_MOUSE_Out = "onmouseout";
var EVENT_MOUSE_DblClick = "ondblclick";
//全局计时器
var timerId = false;
//场景透明度
var StageOpacity = 1;
//游戏是否开始
var thegameStart = false;
//分数
var ScoreNum = 0;

document.onclick = function (e) { if (coreStage2d) coreStage2d.isMouseEvent(e, EVENT_MOUSE_Click);};
document.onmousedown = function (e) { if (coreStage2d) coreStage2d.isMouseEvent(e, EVENT_MOUSE_Down); };
document.onmouseup = function (e) { if (coreStage2d) coreStage2d.isMouseEvent(e, EVENT_MOUSE_Up); };
document.onmousemove = function (e) { if (coreStage2d) coreStage2d.isMouseEvent(e, EVENT_MOUSE_Move); };
document.onmouseout = function (e) { if (coreStage2d) coreStage2d.isMouseEvent(e, EVENT_MOUSE_Out); };
document.ondblclick = function (e) { if (coreStage2d) coreStage2d.isMouseEvent(e, EVENT_MOUSE_DblClick); };

(function loadImag() {
    var imageObj = new Image();
    imageObj.src = imageAddress[imageId];
    imageObj.onload = function () {
        imageStart.push(imageObj);
        imageId++;
        if (imageId < imageAddress.length) {
            loadImag();
        } else {
            startScene();
        }
    }
})()
//场景管理器
function Stage2D() {
    //初始化启动计时器
    this.init = function () {
        coreStage2d = this;

        setTimeout(paint, 0);
    }
    //鼠标检测函数
    this.isMouseEvent = function (e, event) {
        for (var i = displayList.length - 1; i >= 0; i--) {

            var dl = displayList[i];
            var mc = mouseCoord(e.pageX, e.pageY);

            if (mc.x < dl.x + dl.width && mc.x > dl.x && mc.y < dl.y + dl.height && mc.y > dl.y) {
                if (dl[event]) dl[event]();
                return;
            }
        }
    }
    //添加子对象
    this.addChild = function (child, layer) {
        if (layer) {
            for (var i = displayList.length - 1; i >= layer; i--) {
                displayList[i + 1] = displayList[i];
            }
            displayList[layer] = child;
            return;
        }
        displayList.push(child);
    }
    //删除子对象
    this.removeChild = function (child) {
        if (isNaN(child)) child = indexOf(displayList, child);
        this.removeAn(displayList[child]);
        displayList.splice(child, 1);
    }
    //删除动画对象
    this.removeAn = function (pro) {
        for (var i = 0; i < animeList.length; i++) {
            switch (typeof pro) {
                case 'string':
                    if (animeList[i].id == pro) {
                        animeList.splice(i, 1);
                        i--;
                    }
                    break;
                case 'object':
                    if (animeList[i].elem == pro) {
                        animeList.splice(i, 1);
                        i--;
                    } break;
            }
        }
    }
}
//重绘核心
function paint() {

    context.clearRect(0, 0, stageWidth, stageHeight);

    ArraySort();

    for (var i = 0; i < animeList.length; i++) {
        animeList[i].paint();
    }
    for (var i = 0; i < displayList.length; i++) {

        if (displayList[i].death) {
            coreStage2d.removeChild(displayList[i]);
            i--;
            continue;
        }
        if (displayList[i].onpaint) displayList[i].onpaint();
    }
    for (var i = 0; i < displayList.length; i++) {
        displayList[i].paint();
    }
    requestAnimationFrame(paint);
}
//排序
function ArraySort(fn) {

    fn = fn || function (x, y) { return x - y };

    var dL = displayList;

    for (var i = 0; i < dL.length; i++) {
        for (var j = i; j < dL.length; j++) {
            if (fn(dL[i].zIndex, dL[j].zIndex) > 0) {
                var t = dL[i];
                dL[i] = dL[j];
                dL[j] = t;
            }
        }
    }
}
//开始场景
function startScene() {
    var stage2d = new Stage2D();
    stage2d.init();

    //背景
    var bg = new object();
    bg.id = '背景';
    bg.img = imgList.bg_day;
    bg.zIndex = -1;
    bg.init();
    stage2d.addChild(bg);
    //地面
    var land = new object();
    land.y = 400;
    land.id = '地面';
    land.img = imgList.land;
    land.init();
    land.onpaint = function () {
        if ((land.x -= 1.5) == -48) land.x = 0;
    }
    stage2d.addChild(land);
    //游戏名
    var name = new object();
    name.y = 100;
    name.id = '游戏名';
    name.middle = true;
    name.img = imgList.title;
    name.init();
    stage2d.addChild(name);
    //小鸟
    var bird = new object();
    bird.y = 200;
    bird.id = '小鸟';
    bird.middle = true;
    bird.type = randomNum(0, 2);
    bird.img = imgList['bird' + bird.type + '_0'];
    bird.init();
    bird.animation({
        property: {
            y: 190 ,
        },
        duration: 500,
        id:'上下动画',
        repet: 'tran_repet'
    }).animation({
        property: {
            img: [
                imgList['bird' + bird.type + '_0'],
                imgList['bird' + bird.type + '_1'],
                imgList['bird' + bird.type + '_2']
            ]
        },
        duration: 200,
        id:'扇翅动画',
        repet: 'tran_repet'
    });
    stage2d.addChild(bird);
    //开始按钮
    var butt = new object();
    butt.x = 20;
    butt.y = 320;
    butt.id = '开始按钮';
    butt.img = imgList.button_play;
    butt.onclick = function () {
        SceneAn(window, 500, 1, 0, 'StageOpacity', function () {
            SceneTwo();
            SceneAn(window, 200, 0, 1, 'StageOpacity');
        });
        butt.onclick = null;
    }
    butt.init();
    stage2d.addChild(butt);
    //排名按钮
    var butt2 = new object();
    butt2.x = 150;
    butt2.y = 320;
    butt2.id = '排名按钮';
    butt2.img = imgList.button_score;
    butt2.init();
    stage2d.addChild(butt2);
}
//场景2
function SceneTwo() {
    coreStage2d.removeChild('游戏名');
    coreStage2d.removeChild('开始按钮');
    coreStage2d.removeChild('排名按钮');
    coreStage2d.removeChild('小鸟');

    //分数
    var score = new text();
    score.id = '分数';
    score.y = 60;
    score.space = 2;
    score.textImg = [
        imgList.font_048,
        imgList.font_049,
        imgList.font_050,
        imgList.font_051,
        imgList.font_052,
        imgList.font_053,
        imgList.font_054,
        imgList.font_055,
        imgList.font_056,
        imgList.font_057
    ];
    score.textAlign = 'center';
    score.onpaint = function () {
        this.value = ScoreNum;
    }
    coreStage2d.addChild(score);

    //准备好
    var prep = new object();
    prep.id = '准备好';
    prep.y = 135;
    prep.middle = true;
    prep.img = imgList.text_ready;
    prep.init();
    coreStage2d.addChild(prep);

    //操作指南
    var guide = new object();
    guide.id = '操作指南';
    guide.y = 230;
    guide.middle = true;
    guide.img = imgList.tutorial;
    guide.init();
    coreStage2d.addChild(guide);

    //小鸟
    var bird = new object();
    bird.x = 60;
    bird.y = 230;
    bird.id = '小鸟';
    bird.type = randomNum(0, 2);
    bird.img = imgList['bird' + bird.type + '_0'];
    bird.init();
    bird.animation({
        property: {
            y: 240
        },
        duration: 500,
        id:'上下飞行',
        repet: 'tran_repet'
    }).animation({
        property: {
            img: [
                imgList['bird' + bird.type + '_0'],
                imgList['bird' + bird.type + '_1'],
                imgList['bird' + bird.type + '_2']
            ]
        },
        duration: 200,
        id: '扇翅动画',
        repet: 'tran_repet'
    });
    coreStage2d.addChild(bird);

    var Fs = new object();
    Fs.width = stageWidth;
    Fs.height = stageHeight;
    Fs.id = '全屏事件';
    Fs.zIndex = 10;
    Fs.onmousedown = function () {
        control();
        if (!thegameStart) {

            StageOpacity = null;
            thegameStart = true;
            animeList.splice(indexOf(animeList, '上下飞行'), 1);

            appWpipe();

            SceneAn(displayList[indexOf(displayList, '准备好')], 100, 1, 0, 'alpha', function () {
                coreStage2d.removeChild('准备好');
            });
            SceneAn(displayList[indexOf(displayList, '操作指南')], 100, 1, 0, 'alpha', function () {
                coreStage2d.removeChild('操作指南');
            });
        }
    }
    Fs.init();
    coreStage2d.addChild(Fs);
}
//控制小鸟
function control() {

    coreStage2d.removeAn('小鸟下降');
    coreStage2d.removeAn('小鸟上升');
    coreStage2d.removeAn('小鸟下降旋转');

    var bird = displayList[indexOf(displayList, '小鸟')];

    bird.animation({
        property: {
            y: bird.y - 50,
            rotation: -20
        },
        duration: 200,
        repet: 'no_repet',
        easing: Tween.Linear,
        id: '小鸟上升',
        callback: function () {
            birdFalling(bird);
        }
    });
    if (indexOf(animeList, '扇翅动画') == -1) {
        bird.animation({
            property: {
                img: [
                    imgList['bird' + bird.type + '_0'],
                    imgList['bird' + bird.type + '_1'],
                    imgList['bird' + bird.type + '_2']
                ]
            },
            duration: 200,
            id: '扇翅动画',
            repet: 'tran_repet'
        });
    }
}
//小鸟下降动画
function birdFalling(bird) {
    bird.animation({
        property: {
            y: 360
        },
        duration: 700,
        repet: 'no_repet',
        easing: Tween.Cubic.easeIn,
        id: '小鸟下降'
    }).animation({
        property: {
            rotation: 90
        },
        duration: 600,
        repet: 'no_repet',
        easing: Tween.Quint.easeIn,
        id: '小鸟下降旋转',
        callback: function () {
            coreStage2d.removeAn('扇翅动画');
            bird.img = imgList['bird' + bird.type + '_1'];
        }
    });
}
//开始游戏
function GameStart() {


}
//生成水管
function appWpipe() {
    var WpipeHeight = GetRandomNum(50, 270);
    //水管
    var Wpipe = new object();
    Wpipe.id = '水管';
    Wpipe.x = 288;
    Wpipe.y = -WpipeHeight;
    Wpipe.img = imgList.pipe_down;
    Wpipe.visi = false;
    Wpipe.zIndex = 0;
    Wpipe.onpaint = function () {

        WpipeEvent(Wpipe);

        if (Wpipe.x == 120) appWpipe();

        if (!Wpipe.visi) {
            var bird = displayList[indexOf(displayList, '小鸟')];
            if (bird.x + bird.width > Wpipe.x + Wpipe.width / 2) {
                ScoreNum++;
                Wpipe.visi = true;
            }
        }
    }
    Wpipe.init();
    coreStage2d.addChild(Wpipe);

    var Wpipe2 = new object();
    Wpipe2.id = '水管';
    Wpipe2.x = 288;
    Wpipe2.y = 320 - WpipeHeight + 100;
    Wpipe2.height = 400 - Wpipe2.y;
    Wpipe2.img = imgList.pipe_up;
    Wpipe2.zIndex = 0;
    Wpipe2.onpaint = function () {
        WpipeEvent(Wpipe2);
    }
    Wpipe2.init();
    coreStage2d.addChild(Wpipe2);
}
//水管事件
function WpipeEvent(Wpipe) {

    Wpipe.x -= 1.5;

    var bird = displayList[indexOf(displayList, '小鸟')];

    if (roundAndRectan(bird.tranX, bird.tranY, 11, Wpipe.x, Wpipe.y, Wpipe.width, Wpipe.height)) {
        gameOver(bird);
    }

    if (Wpipe.x == -52) Wpipe.death = true;
}
//游戏结束
function gameOver(bird) {
    displayList[indexOf(displayList, '全屏事件')].death = true;
    displayList[indexOf(displayList, '分数')].death = true;

    coreStage2d.removeAn('小鸟上升');

    for (var i = 0; i < displayList.length; i++) {
        if (displayList[i].id == '水管') displayList[i].onpaint = null;
        if (displayList[i].id == '地面') displayList[i].onpaint = null;
    }

    birdFalling(bird);

    overScene();
}
//结束场景
function overScene() {
    //游戏结束
    var gOver = new object();
    gOver.id = '游戏结束';
    gOver.y = -20;
    gOver.middle = true;
    gOver.img = imgList.text_game_over;
    gOver.init();
    gOver.animation({
        property: {
            y: 100
        },
        duration: 1000,
        repet: 'no_repet',
        easing: Tween.Bounce.easeOut,
        id: '游戏结束反弹动画'
    });
    coreStage2d.addChild(gOver);
    //得分榜
    var scoring = new object();
    scoring.id = '游戏结束';
    scoring.y = stageHeight;
    scoring.middle = true;
    scoring.img = imgList.score_panel;
    scoring.init();
    scoring.animation({
        property: {
            y: 170
        },
        duration: 500,
        repet: 'no_repet',
        easing: Tween.Cubic.easeOut,
        id: '得分榜反弹动画',
        callback: function () {
            //开始按钮
            var butt = new object();
            butt.x = 20;
            butt.y = 320;
            butt.id = '开始按钮';
            butt.alpha = 0;
            butt.img = imgList.button_play;
            butt.animation({
                property: {
                    alpha: 1
                },
                duration: 500,
                repet: 'no_repet',
                easing: Tween.Linear,
                id: '开始按钮'
            });
            butt.onclick = function () {
                SceneAn(window, 500, 1, 0, 'StageOpacity', function () {
                    SceneTwo();
                    SceneAn(window, 200, 0, 1, 'StageOpacity');
                });
                butt.onclick = null;
            }
            butt.init();
            coreStage2d.addChild(butt);
            //排名按钮
            var butt2 = new object();
            butt2.x = 150;
            butt2.y = 320;
            butt2.id = '排名按钮';
            butt2.alpha = 0;
            butt2.img = imgList.button_score;
            butt2.animation({
                property: {
                    alpha: 1
                },
                duration: 500,
                repet: 'no_repet',
                easing: Tween.Linear,
                id: '排名按钮'
            });
            butt2.init();
            coreStage2d.addChild(butt2);
        }
    });
    coreStage2d.addChild(scoring);

    var textImg = [
        imgList.number_score_00,
        imgList.number_score_01,
        imgList.number_score_02,
        imgList.number_score_03,
        imgList.number_score_04,
        imgList.number_score_05,
        imgList.number_score_06,
        imgList.number_score_07,
        imgList.number_score_08,
        imgList.number_score_09
    ]
    //当前分数
    var NowS = new text();
    NowS.id = '当前分数';
    NowS.x = 220;
    NowS.y = 205;
    NowS.space = 1;
    NowS.textAlign = 'right';
    NowS.textImg = textImg;
    NowS.animation({
        property: {
            value: ScoreNum
        },
        duration: 1000,
        repet: 'no_repet',
        easing: Tween.Linear,
        id: '分数'
    });
    coreStage2d.addChild(NowS);
    //最高分数
    var MaxS = new text();
    MaxS.id = '最高分数';
    MaxS.x = 220;
    MaxS.y = 247;
    MaxS.space = 1;
    MaxS.textAlign = 'right';
    MaxS.textImg = textImg;
    coreStage2d.addChild(MaxS);
}
//场景透明度动画
function SceneAn(elem, duration, start, end, name, callback) {
    var operate = getOpt({
        duration: duration,
        repet: 'no_repet',
        easing: Tween.Cubic.easeOut,
        callback: callback
    })
    var fx = new FX(elem, operate, name);
    var start = start;
    var end = end;
    fx.id = '透明度动画';
    fx.init(start, end);
}
//游戏对象
function object() {
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.visible = true;
    this.alpha = 1;
    this.middle = false;//是否居中画面
    this.img = null;
    this.width = null;
    this.height = null;
    this.img_x = 0;//切割点X
    this.img_y = 0;//切割点Y
    this.id = null;
    this.tranX = 0;
    this.tranY = 0;

    this.death = false;//死亡

    this.zIndex = 1;//显示顺序


    this.onpaint = null;
    this.onclick = null;//单击事件
    this.onmousedown = null;//鼠标按下
    this.onmouseup = null;//鼠标抬起
    this.onmousemove = null;//鼠标滑过
    this.onmouseout = null;//鼠标离开
    this.ondblclick = null;//鼠标双击

    this.init = function () {
        this.width = this.width ? this.width : this.img[0];
        this.height = this.height ? this.height : this.img[1];
    }
    this.paint = function () {

        if (!this.img) return;

        this.tranX = this.x + this.width / 2;
        this.tranY = this.y + this.height / 2;

        if (this.middle) {
            this.x = stageWidth / 2 - this.width / 2;
        }

        context.save();
        context.translate(this.tranX, this.tranY);
        context.globalAlpha = StageOpacity != null ? StageOpacity : this.alpha;
        context.rotate(this.rotation * Math.PI / 180);
        context.scale(this.scaleX, this.scaleY);
        context.drawImage(imageStart[0], this.img[2] * 1024, this.img[3] * 1024, this.width, this.height, -this.width/2, -this.height/2, this.width, this.height);
        context.restore();
    }
    //动画
    this.animation = function (arg) {

        var operate = getOpt(arg);
        var property = arg.property;

        for (var name in property) {

            var fx = new FX(this, operate, name);
            var st_end = this.dealArray(this[name], property[name]);

            var start = st_end.start;
            var end = st_end.end;

            fx.id = arg.id;
            fx.attr = st_end.attr;
            fx.init(start, end);
        }
        return this;
    }
    //返回数组信息
    this.dealArray = function (start, end) {
        var attr = null;
        if (typeof end == 'object') {
            attr = end;
            start = 0;
            end = end.length - 1;
        }
        return { start: start, end: end, attr: attr };
    }
    //修改属性值
    this.cationUp = function (name, value) {
        if(!this.death) this[name] = value;
    }
}
//文本
function text() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.visible = true;
    this.alpha = 1;
    this.id = null;
    this.zIndex = 1;
    this.textAlign = 'left';//对齐方式

    this.space = 0;//字间距

    this.textImg = null;
    this.img = [];

    this.value = 0;//显示值


    this.onpaint = null;
    this.onclick = null;//单击事件
    this.onmousedown = null;//鼠标按下
    this.onmouseup = null;//鼠标抬起
    this.onmousemove = null;//鼠标滑过
    this.onmouseout = null;//鼠标离开
    this.ondblclick = null;//鼠标双击

    this.paint = function () {

        this.img.length = 0;
        this.width = 0;

        var val = this.value.toString();
        for (var i = 0; i < val.length; i++) {
            var img_ = this.textImg[parseInt(val.substring(i, i + 1))];
            this.width += img_[0];
            this.img.push(img_);
        }
        this.tranX = this.x + this.width / 2;
        this.tranY = this.y + this.height / 2;

        var x = 0;

        switch (this.textAlign) {
            case 'right':
                x = this.x - this.width;
                break;
            case 'center':

                this.x = stageWidth / 2 - this.width / 2;
                x = -this.img[0][0] - this.space + this.x;

                break;
        }
        
        for (var i = 0; i < this.img.length; i++) {
            x += this.img[i ? i - 1 : i][0] + this.space;
            this.draw(this.img[i], x , this.y);
        }

    }
    this.draw = function (img,x,y) {
        context.save();
        context.globalAlpha = StageOpacity != null ? StageOpacity : this.alpha;
        context.rotate(this.rotation * Math.PI / 180);
        context.scale(this.scaleX, this.scaleY);
        context.drawImage(imageStart[0], img[2] * 1024, img[3] * 1024, img[0], img[1], x, y, img[0], img[1]);
        context.restore();
    }
    //动画
    this.animation = function (arg) {

        var operate = getOpt(arg);
        var property = arg.property;

        for (var name in property) {

            var fx = new FX(this, operate, name);

            var start = this[name];
            var end = property[name];

            fx.id = arg.id;
            fx.init(start, end);
        }
        return this;
    }
    //修改属性值
    this.cationUp = function (name, value) {
        if (name == 'value') value = parseInt(value);
        if (!this.death) this[name] = value;
    }
}
//动画对象封装
function getOpt(arg) {
    if (!arg.easing) arg.easing = Tween.Linear;
    return {
        duration: arg.duration,
        repet: arg.repet,
        easing: arg.easing,
        callback: arg.callback,
        callHalf: arg.callHalf
    };
}
//查询对象是否在数组中
function indexOf(Array, Object) {
    for (var i = 0; i < Array.length; i++) {
        switch (typeof Object) {
            case 'string': if (Array[i].id == Object) return i; break;
            case 'object': if (Array[i] == Object) return i; break;
        }
    }
    return -1;
}
//动画逻辑函数
function FX(elem, options, name) {
    this.elem = elem;
    this.options = options;//
    this.name = name;//属性名
    this.startTime = 0;//开始的时间
    this.start = 0;//属性开始的值
    this.end = 0;//属性结束的值
    this.attr = null;//动画数组
    this.repeN = true;//重复进度
    this.isperform = false;//动画结束
    this.id = null;
    //初始化
    this.init = function (from, to) {
        this.startTime = new Date().getTime();
        this.start = from;
        this.end = to;
        animeList.push(this);
    }
    this.paint = function () {
        var t = new Date().getTime();
        if (this.isperform) {

            this.startTime = t;
            this.isperform = false;
        }
        if (t >= this.startTime + this.options.duration) {

            this.Upattr(this.end);
            this.isperform = true;
            this.repet();

        } else {

            var n = t - this.startTime;
            var pos = this.options.easing(n, this.start, this.end - this.start, this.options.duration);

            if (this.attr) this.Upattr(this.repeN ? Math.floor(pos) : Math.ceil(pos));
            else this.Upattr(pos);
        }
    }
    this.remove = function () {

        if (this.options.callback) this.options.callback();
        animeList.splice(indexOf(animeList, this), 1);
    }
    //应用对象的属性
    this.Upattr = function (value) {
        this.elem.cationUp(this.name, !this.attr ? value : this.attr[value]);
    }
    //动画重复执行判断
    this.repet = function () {
        var repet = this.options.repet;
        if (repet == 'no_repet') this.remove();
        else if (repet == 'tran_repet') {
            var temp = this.start;
            this.start = this.end;
            this.end = temp;
            this.repeN = reverBool(this.repeN);
        }
        else if (!isNaN(repet)) this.playNum++;
    }
}

window.cationUp = function (name,value) {
    window[name] = value;
}
//产生给定数字之间的随机数
function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}
//反转Boolean
function reverBool(Bool) {
    return Bool ? false : true;
}
//返回鼠标相对画布坐标
function mouseCoord(x, y) {
    return { x: x - canvas.offsetLeft, y: y - canvas.offsetTop };
}
//获取指定范围的随机数
function randomNum(min, max) {
    return min + Math.round(Math.random() * (max - min));
}
//圆和矩形碰撞检测
function roundAndRectan(x1, y1, rad, x2, y2, w2, h2) {

    return x1 + rad > x2 && y1 - rad < y2 + h2 && y1 + rad > y2 && x1 - rad < x2 + w2;

}
