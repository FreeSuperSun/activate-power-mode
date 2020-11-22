//绘制彩弹的画布初始化
function initCanvas() {
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:999999';
    //屏幕发生尺寸变化的时候重置canvas尺寸
    window.addEventListener('resize', function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    document.body.appendChild(canvas);
    return canvas;
}

let canvas = initCanvas();

//canvas的上下文
//TODO canvas相关
let canvasContext = canvas.getContext('2d');
//彩弹的数组
let particles = [];
//操作每个彩弹的位置变量
let particlePointer = 0;
//TODO 是否渲染? 标识是否正在渲染
let rendering = false;
//设置是否震动窗口
POWERMODE.shake = true;

//随机数,包含min 不包含max
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getColor(el) {
    if (POWERMODE.colorful) {
        let u = getRandom(0, 360);
        return 'hsla(' + getRandom(u - 10, u + 10) + ', 100%, ' + getRandom(50, 80) + '%, ' + 1 + ')';
    } else {
        return window.getComputedStyle(el).color;
    }
}

//取得光标
function getCaret() {
    //取得当前激活的元素
    //TODO document.activeElement
    let el = document.activeElement;
    //TODO bcr is what?
    let bcr = null;
    //如果是Textarea元素或者是text类型的input元素时
    if (el.tagName === 'TEXTAREA' ||
        (el.tagName === 'INPUT' && el.getAttribute('type') === 'text')) {
        var offset = require('textarea-caret-position')(el, el.selectionEnd, {debug: false});
        bcr = el.getBoundingClientRect();
        return {
            x: offset.left + bcr.left,
            y: offset.top + bcr.top,
            color: getColor(el)
        };
    }
    var selection = window.getSelection();
    if (selection.rangeCount) {
        var range = selection.getRangeAt(0);
        var startNode = range.startContainer;
        if (startNode.nodeType === document.TEXT_NODE) {
            startNode = startNode.parentNode;
        }
        bcr = range.getBoundingClientRect();
        return {
            x: bcr.left,
            y: bcr.top,
            color: getColor(startNode)
        };
    }
    return {x: 0, y: 0, color: 'transparent'};
}

//生成一个彩弹的属性
function createParticle(x, y, color) {
    return {
        x: x,
        y: y,
        alpha: 1,
        color: color,
        velocity: {//速度
            x: -1 + Math.random() * 2,//-1,1 横向会向左向右
            y: -3.5 + Math.random() * 2//-3.5,-1.5 垂直向上
        }
    };
}

POWERMODE.colorful = false;

//重绘函数
function loop() {
    //正在渲染
    rendering = true;
    //TODO clearRect 清空整个canvas
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    //设置渲染完成为false
    let rendered = false;
    let rect = canvas.getBoundingClientRect();
    //TODO for循环不是可以用const吗?
    //对每个小球进行绘制
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];
        //如果小球的alpha到了0.1,就再不继续绘制下一次了,就消失了
        if (particle.alpha <= 0.1)
            continue;
        // 垂直方向速度减小,模拟抛物到下落的过程,应该最终的效果是1秒9.8
        //TODO 是怎么控制刷新频率的?
        particle.velocity.y += 0.075;
        //水平 垂直 位移
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        //小球逐渐消失
        particle.alpha *= 0.96;
        canvasContext.globalAlpha = particle.alpha;
        canvasContext.fillStyle = particle.color;
        //画出小球
        //TODO fillRect的用法
        canvasContext.fillRect(
            Math.round(particle.x - 1.5) - rect.left,
            Math.round(particle.y - 1.5) - rect.top,
            3, 3
        );
        //只要有一次循环,就会设成true,否则就会false,这是个递归条件.
        //可以配合前面的continue,如果某个循环一次小球都没画,说明已经画完了.
        //rendered就会是false,就不会进行下一次的递归.
        rendered = true;
    }
    //如果上次还画过小球,就进行下一次递归
    if (rendered) {
        requestAnimationFrame(loop);
    } else {
        //否则,就把rendering设为false,表示不在渲染中.
        rendering = false;
    }
}


//彩弹
function POWERMODE() {
    { // spawn particles
        //取得光标的位置
        let caret = getCaret();
        //设置彩弹的数量 0到15个
        let numParticles = 5 + Math.round(Math.random() * 10);
        //设置每个彩弹
        while (numParticles--) {
            //给数组里面填充彩弹
            particles[particlePointer] = createParticle(caret.x, caret.y, caret.color);
            //这里应该是设置彩弹上限的,最多500个
            //这里应该没用吧,在上面设置彩弱的时候注意就行了
            particlePointer = (particlePointer + 1) % 500;
        }
    }
    { // shake screen
        if (!rendering) {
            //TODO 重绘?
            requestAnimationFrame(loop);
        }
    }
}

//导出模块
module.exports = {POWERMODE: POWERMODE};
