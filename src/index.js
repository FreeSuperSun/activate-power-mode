'use strict';

var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:999999';
window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
document.body.appendChild(canvas);
var context = canvas.getContext('2d');
//彩弹的数组
let particles = [];
//操作每个彩弹的位置变量
let particlePointer = 0;
//TODO 是否渲染? 标识是否正在渲染
let rendering = false;

POWERMODE.shake = true;

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function getColor(el) {
    if (POWERMODE.colorful) {
        var u = getRandom(0, 360);
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

//创建彩弹
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
    context.clearRect(0, 0, canvas.width, canvas.height);
    //设置渲染完成为false
    let rendered = false;
    let rect = canvas.getBoundingClientRect();
    //TODO for循环不是可以用const吗?
    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];
        if (particle.alpha <= 0.1)
            continue;
        particle.velocity.y += 0.075;
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.alpha *= 0.96;
        context.globalAlpha = particle.alpha;
        context.fillStyle = particle.color;
        context.fillRect(
            Math.round(particle.x - 1.5) - rect.left,
            Math.round(particle.y - 1.5) - rect.top,
            3, 3
        );
        rendered = true;
    }
    if (rendered) {
        requestAnimationFrame(loop);
    } else {
        rendering = false;
    }
}

//主程序入口
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
        if (POWERMODE.shake) {
            var intensity = 1 + 2 * Math.random();
            var x = intensity * (Math.random() > 0.5 ? -1 : 1);
            var y = intensity * (Math.random() > 0.5 ? -1 : 1);
            document.body.style.marginLeft = x + 'px';
            document.body.style.marginTop = y + 'px';
            setTimeout(function () {
                document.body.style.marginLeft = '';
                document.body.style.marginTop = '';
            }, 75);
        }
    }
    if (!rendering) {
        //TODO 重绘?
        requestAnimationFrame(loop);
    }
};
module.exports = POWERMODE;
