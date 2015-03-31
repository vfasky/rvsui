/**
 * 组件基类 
 * @date 2015-03-30 22:58:24
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/widgetBase', ['jquery', 'stapes', 'rivets'], function($, stapes, rivets){
    "use strict";

    var id = 0; 

    var map = {};
    
    var WidgetBase = stapes.subclass({
        constructor: function(el, view){
            this.id = id++;
            this.view = view;
            this.$soure = $(el);
            this.init();
            this.watch();
        },
        /**
         * init
         *
         * @return {Void}
         */
        init: function(){},
        /**
         * 监听事件
         *
         * @return {Void}
         */
        watch: function(){},
        /**
         * 取值
         *
         * @return {undefined}
         */
        getValue: function(){
            return this.$soure.val();
        },
        /**
         * 更新值
         *
         * @param {String} value
         * @return {Void}
         */
        update: function(value){
            this.$soure.val(value);
        },
        /**
         * 销毁事件
         *
         * @return {Void}
         */
        destroy: function(){
            this.$soure.remove();
            if(this.$el){
                this.$el.remove();
            }
        },
        /**
         * 同步数据到view
         *
         * @param {String} value
         * @return {Void}
         */
        sync: function(value){
            if(this.view.keypath.indexOf(':') !== -1){
                var temp = this.view.keypath.split(':');
                var root = temp[0];
                var keypath = temp.pop();
                var key = keypath.split('.').pop();
                var self = this.view.observer.obj[root];
                if(self){
                    this.view.model.set(key, value);
                }
            }
        }
    });

    /**
     * 注册一个标签组件
     *
     * @param {String} tag - 注册的标签名称
     * @param {Object} Widget
     * @return {Void}
     */
    WidgetBase.reg = function(tag, Widget){
        map[tag] = Widget;
        rivets.binders[tag] = {
            bind: function(el){
                this.widget = new Widget(el, this);    
            },
            unbind: function() {
                this.widget.destroy();
            },
            routine: function(el, value){
                this.widget.update(value || '', el);
            }
        };
    };

    /**
     * 从注册的标签中，取对象
     *
     * @param {String} tag
     * @return {WidgetBase}
     */
    WidgetBase.get = function(tag){
        return map[tag];
    };

    return WidgetBase;
});
