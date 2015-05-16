/**
 * APP
 * @date 2015-03-26 16:02:10
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/app', ['jquery', 'stapes', 'rvsui/route'], function($, stapes, route) {
    "use strict";

    return stapes.subclass({
        constructor: function($el, options) {
            this.$el = $el;
            this.options = $.extend({
                viewClass: 'rvsui-view'
            }, options);

            this._view = null;
            this._onLoad = {};
        },
        /**
         * 绑定路由
         *
         * @param {String} path - 路由规则
         * @param {String} viewName - view的名称
         * @return {rvsui.App}
         */
        route: function(path, viewName) {
            var self = this;
            route(path, function() {
                self.runView(viewName, arguments);
            });
            return this;
        },
        run: function() {
            route.reload();
        },
        /**
         * 调度view
         *
         * @param {String} viewName - view 名称
         * @param {Array} args - 参数名
         * @return {Void}
         */
        runView: function(viewName, args) {
            
            var self = this;
            if (this._view) {
                if (this._view.name === viewName) {
                    this._view.instantiate.run.apply(this._view.instantiate, args);
                    return;
                } else {
                    this._view.instantiate.destroy();
                }
            }

            require([viewName], function(View) {
                var $el = $('<div class="' + self.options.viewClass + '"></div>');
                var view = {
                    name: viewName,
                    instantiate: new View($el, self)
                };
                self._view = view;
                view.instantiate.run.apply(view.instantiate, args);
                view.instantiate.$el.appendTo(self.$el);
            });

        }
    });

});
