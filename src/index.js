//震动窗口
function shakeWindow() {
    //随机指定系数 1-3
    let intensity = 1 + 2 * Math.random();
    //随机指定方向
    let x = intensity * (Math.random() > 0.5 ? -1 : 1);
    let y = intensity * (Math.random() > 0.5 ? -1 : 1);
    //设置偏移
    document.body.style.marginLeft = x + 'px';
    document.body.style.marginTop = y + 'px';
    //计时器恢复原来的位置
    setTimeout(function () {
        document.body.style.marginLeft = '';
        document.body.style.marginTop = '';
    }, 50);
}

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

//彩弹的数组 全局存放,全局显示
//TODO 但是这样也意味着,会有一个500项的数组一直存在内存里
//小球画完,其实是不删的,这样处理应该不太好.
let particles = [];

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

POWERMODE.colorful = true;

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
    //对每个小球进行绘制,一帧绘制一次
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];
        //如果小球的alpha到了0.1,就再不继续绘制下一次了,就消失了
        if (particle.alpha <= 0.1) {
            particles.splice(i, 1);
            //索引-1,否则会因为用了splice导至跳过元素
            i--;
            continue;
        }
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
        //TODO requestAnimationFrame,其实就是要在下一帧调用回调函数
        // 可以用来制作动画效果
        requestAnimationFrame(loop);
    } else {
    }
}


//彩弹
function POWERMODE() {
    {
        //取得光标的位置
        let caret = getCaret();
        //设置彩弹的数量 0到15个
        let numParticles = 5 + Math.round(Math.random() * 10);
        //设置每个彩弹||
        //TODO 这里为什么要用一个全局的变量来存储彩弹呢?
        //TODO 因为这样的话可以让多次按键的彩弹同时存在
        for (let i = 0; i < numParticles && particles.length < 500; i++) {
            //给数组里面填充彩弹
            particles.push(createParticle(caret.x, caret.y, caret.color));
            //注意这里是设置的全屏的彩弹数量,而不是按一次的彩弹数量
            // particlePointer = (particlePointer + 1) % 500;
        }
        if (particles.length === numParticles) {
            //TODO 如果正在渲案中,就没必要再加添loop,因为彩弹已经加到数组里了,也会进行绘制.
            requestAnimationFrame(loop);
        }
    }
}

//导出模块
module.exports = {POWERMODE, shakeWindow};
