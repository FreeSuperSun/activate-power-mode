(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["POWERMODE"] = factory();
	else
		root["POWERMODE"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

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
	        var offset = __webpack_require__(1)(el, el.selectionEnd, {debug: false});
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
	    for (let i = 0; i < particles.length; i++) {
	        let particle = particles[i];
	        if (particle.alpha <= 0.1) continue;
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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	/* jshint browser: true */

	(function () {

	// The properties that we copy into a mirrored div.
	// Note that some browsers, such as Firefox,
	// do not concatenate properties, i.e. padding-top, bottom etc. -> padding,
	// so we have to do every single property specifically.
	    let properties = [
	        'direction',  // RTL support
	        'boxSizing',
	        'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
	        'height',
	        'overflowX',
	        'overflowY',  // copy the scrollbar for IE

	        'borderTopWidth',
	        'borderRightWidth',
	        'borderBottomWidth',
	        'borderLeftWidth',
	        'borderStyle',

	        'paddingTop',
	        'paddingRight',
	        'paddingBottom',
	        'paddingLeft',

	        // https://developer.mozilla.org/en-US/docs/Web/CSS/font
	        'fontStyle',
	        'fontVariant',
	        'fontWeight',
	        'fontStretch',
	        'fontSize',
	        'fontSizeAdjust',
	        'lineHeight',
	        'fontFamily',

	        'textAlign',
	        'textTransform',
	        'textIndent',
	        'textDecoration',  // might not make a difference, but better be safe

	        'letterSpacing',
	        'wordSpacing',

	        'tabSize',
	        'MozTabSize'

	    ];
	    //判断是否为firefox
	    let isFirefox = window.mozInnerScreenX != null;

	    //取得光标的坐标
	    function getCaretCoordinates(element, position, options) {
	        //这样写是为了防止options为空
	        //TODO 访问属性时防止为空的写法
	        //如果options为空,括号内会直接返回false,不会检查options.debug是否存在
	        // let debug = (options && options.debug) || false;
	        //最后面的||false 应该是不需要的吧.前面返回的肯定是布尔值,如果是true则为true
	        //false则为false,后面的||false不起作用
	        let debug = (options && options.debug);
	        //如果传入参数里面debug为true
	        //TODO 这里的debug模式是起什么作用?
	        if (debug) {
	            //TODO document.querySelector使用
	            let el = document.querySelector('#input-textarea-caret-position-mirror-div');
	            if (el) {
	                el.parentNode.removeChild(el);
	            }
	        }

	        // mirrored div
	        let div = document.createElement('div');
	        div.id = 'input-textarea-caret-position-mirror-div';
	        document.body.appendChild(div);

	        let style = div.style;
	        let computed = window.getComputedStyle ? getComputedStyle(element) : element.currentStyle;  // currentStyle for IE < 9

	        // default textarea styles
	        style.whiteSpace = 'pre-wrap';
	        if (element.nodeName !== 'INPUT')
	            style.wordWrap = 'break-word';  // only for textarea-s

	        // position off-screen
	        style.position = 'absolute';  // required to return coordinates properly
	        if (!debug)
	            style.visibility = 'hidden';  // not 'display: none' because we want rendering

	        // transfer the element's properties to the div
	        properties.forEach(function (prop) {
	            style[prop] = computed[prop];
	        });

	        if (isFirefox) {
	            // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
	            if (element.scrollHeight > parseInt(computed.height))
	                style.overflowY = 'scroll';
	        } else {
	            style.overflow = 'hidden';  // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
	        }

	        div.textContent = element.value.substring(0, position);
	        // the second special handling for input type="text" vs textarea: spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
	        if (element.nodeName === 'INPUT')
	            div.textContent = div.textContent.replace(/\s/g, "\u00a0");

	        var span = document.createElement('span');
	        // Wrapping must be replicated *exactly*, including when a long word gets
	        // onto the next line, with whitespace at the end of the line before (#7).
	        // The  *only* reliable way to do that is to copy the *entire* rest of the
	        // textarea's content into the <span> created at the caret position.
	        // for inputs, just '.' would be enough, but why bother?
	        span.textContent = element.value.substring(position) || '.';  // || because a completely empty faux span doesn't render at all
	        div.appendChild(span);

	        var coordinates = {
	            top: span.offsetTop + parseInt(computed['borderTopWidth']),
	            left: span.offsetLeft + parseInt(computed['borderLeftWidth'])
	        };

	        if (debug) {
	            span.style.backgroundColor = '#aaa';
	        } else {
	            document.body.removeChild(div);
	        }

	        return coordinates;
	    }

	    if (typeof module != "undefined" && typeof module.exports != "undefined") {
	        module.exports = getCaretCoordinates;
	    } else {
	        window.getCaretCoordinates = getCaretCoordinates;
	    }

	}());

/***/ })
/******/ ])
});
;