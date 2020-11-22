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


    //取得光标的坐标
    function getCaretCoordinates(element, position, options) {
        //这样写是为了防止options为空
        //TODO 访问属性时防止为空的写法
        // 如果options为空,括号内会直接返回false,不会检查options.debug是否存在
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
        let computed = getComputedStyle(element);

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

        style.overflow = 'hidden';  // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'

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