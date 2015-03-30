/**
 * rivets 配置及扩展
 * @date 2015-03-29 21:58:45
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/rivetsExt', ['rivets'], function(rivets) {
    "use strict";
    
    rivets.adapters[':'] = {
        observe: function(obj, keypath, callback) {
            obj.on('change:' + keypath, callback);
        },
        unobserve: function(obj, keypath, callback) {
            obj.off('change:' + keypath, callback);
        },
        get: function(obj, keypath) {
            return obj.get(keypath);
        },
        set: function(obj, keypath, value) {
            obj.set(keypath, value);
        }
    };

    rivets.configure({
        /**
         * 设置事件传递的方式
         *
         * @param {DOM} target
         * @param {Event} event
         * @param {Object} binding
         * @return {Void}
         */
        handler: function(target, event, binding) {
            if (false === this.call(binding.view.models.self, target, event)) {
                if (event.stopPropagation && event.preventDefault) {
                    event.stopPropagation();
                    event.preventDefault();
                } else {
                    window.event.cancelBubble = true;
                    window.event.returnValue = false;
                }
            }
        }
    });

    rivets.formatters.nl2br = function(value) {
        return String(value || '')
            .replace(/<[^>]+>/g, "")
            .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br/>' + '$2');
    };

    rivets.formatters.link = function(value, join){
        if(!value){
            return '';
        }
        return String(value) + join;
    };

    rivets.formatters.has = function(value, show){
        if(!value){
            return '';
        }
        return show;
    };
});
