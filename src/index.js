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

//绘制彩弹的画布上下文初始化
function initCanvas() {
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:999999';
    //屏幕发生尺寸变化的时候重置canvas尺寸
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    document.body.appendChild(canvas);
    return canvas.getContext('2d')
}

//canvas的上下文
let canvasContext = initCanvas();

//彩弹的数组 全局存放,全局显示
let particles = [];

//随机数,包含min 不包含max
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

//获取颜色
function getColor(el) {
    if (POWERMODE.colorful) {
        let u = getRandom(0, 360);
        return 'hsla(' + getRandom(u - 10, u + 10) + ', 100%, ' + getRandom(50, 80) + '%, ' + 1 + ')';
    } else {
        return window.getComputedStyle(el).color;
    }
}

//取得光标位置
function getCaret() {
    //取得当前激活的元素
    let el = document.activeElement;
    let bcr = null;
    //如果是Textarea元素或者是text类型的input元素时
    if (el.tagName === 'TEXTAREA' ||
        (el.tagName === 'INPUT' && el.getAttribute('type') === 'text')) {
        //偏移量
        let offset = require('textarea-caret-position')(el, el.selectionEnd, {debug: false});
        //位置大小信息
        bcr = el.getBoundingClientRect();
        return {
            x: offset.left + bcr.left,
            y: offset.top + bcr.top,
            color: getColor(el)
        };
    } else {
        return {x: 0, y: 0, color: 'transparent'};
    }
}

//生成一个彩弹
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
    //clearRect 清空整个canvas,这样才会有动画效果,不然会一直保留
    canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
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
        particle.velocity.y += 0.075;
        //水平 垂直 位移
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        //小球逐渐消失
        particle.alpha *= 0.96;
        canvasContext.globalAlpha = particle.alpha;
        canvasContext.fillStyle = particle.color;
        //画出小球
        canvasContext.fillRect(
            Math.round(particle.x - 1.5),
            Math.round(particle.y - 1.5),
            3, 3
        );
    }
    //如果数组中还有要显示的彩弹,就进行下一次动画
    if (particles.length > 0) {
        requestAnimationFrame(loop);
    }
}


//彩弹
function POWERMODE() {
    //取得光标的位置
    let caret = getCaret();
    //设置彩弹的数量 5到15个
    let numParticles = 5 + Math.round(Math.random() * 10);
    //设置每个彩弹
    for (let i = 0; i < numParticles && particles.length < 500; i++) {
        //给数组里面填充彩弹
        particles.push(createParticle(caret.x, caret.y, caret.color));
    }
    //只有当前数组为空,且本次插入了几个彩弹的时候,才需要开始动画.如果现在有动画运行,就
    //不能再次绑定动画函数,,否则会使动画加速.
    if (particles.length === numParticles) {
        //如果正在渲案中,就没必要再加添loop,因为彩弹已经加到数组里了,也会进行绘制.
        requestAnimationFrame(loop);
    }
}

//导出模块
module.exports = {POWERMODE, shakeWindow};
