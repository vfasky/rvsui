/**
 * View
 * @module rvsui/view
 * @date 2015-03-26 14:25:39
 * @author vfasky <vfasky@gmail.com>
 */
define('rvsui/view', ['jquery', 'stapes', 'rivets', 'rvsui/rivetsExt'], function($, stapes, rivets) {
    "use strict";

    var $title = $('title');

    /**
     * @alias rvsui/view
     * @constructor
     * @return {stapes.subclass}
     */
    return stapes.subclass({
        constructor: function($el, app) {
            this.$el = $el;
            this.app = app;
            this._initTplUri = null;
            this.init();
        },
        /**
         * 接口
         *
         * @return {Void}
         */
        init: function() {},
        /**
         * 接口，从路由中命中，执行
         *
         * @return {Void}
         */
        run: function() {},
        /**
         * 监听dom事件
         *
         * @return {Void}
         */
        watch: function() {},
        /**
         * 设置页面标题
         *
         * @param {String} title - 标题
         * @return {Void}
         */
        setTitle: function(title) {
            $title.text(title);
        },
        /**
         * 调用浏览器的后退操作
         *
         * @return {Void}
         */
        back: function() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '#';
            }
            return false;
        },
        /**
         * 销毁
         *
         * @return {Void}
         */
        destroy: function() {
            this.unbind();
            this.$el.remove();
        },
        /**
         * 渲染模板
         *
         * @param {String} uri - 模板路径
         * @param {Object} data - {key: promise}, key 将传递到模板中
         * @return {promise}
         */
        render: function(uri, data) {
            if (!data) {
                return this.initTpl(uri);
            }
            var self = this;
            var dtd = $.Deferred();

            this.initTpl(uri).done(function() {
                var keys = Object.keys(data);
                var promises = [];
                keys.forEach(function(key) {
                    promises.push(data[key]);
                });
                self.when.apply(self, promises).done(function() {
                    var args = Array.prototype.slice.call(arguments);

                    $.each(args, function(k, v) {
                        var key = keys[k];
                        if (key) {
                            self.set(key, v);
                        }
                    });
                    dtd.resolve();

                }).fail(function() {
                    dtd.reject();
                });
            }).fail(function() {
                dtd.reject();
            });

            return dtd.promise();
        },
        /**
         * 将模板加入this.el, 并绑定
         * 注：同一uri,只会执行一次
         *
         * @param uri
         * @return {promise}
         */
        initTpl: function(uri) {
            var dtd = $.Deferred();
            var self = this;

            if (this._initTplUri === uri) {
                dtd.resolve(this.view);
            } else {
                if (null !== this._initTplUri) {
                    this.unbind();
                }
                this.loadTpl(uri).done(function(html) {
                    self.$el.html(html);
                    dtd.resolve(self.bind());
                    self.watch();
                }).fail(function() {
                    dtd.reject();
                });
            }
            return dtd.promise();
        },
        /**
         * 加载模板
         *
         * @param {String} uri - 模板路径
         * @return {promise}
         */
        loadTpl: function(uri) {
            var dtd = $.Deferred();
            var info = uri.split('/');
            if (info.length === 2) {
                require(['tpl/' + info[0]], function(tpl) {
                    var html = tpl[info[1]];
                    dtd.resolve(html);
                });
            }
            return dtd.promise();
        },
        bind: function() {
            if (this.view) {
                return this.view;
            }
            this.view = rivets.bind(this.$el, {
                self: this
            });

            return this.view;
        },
        unbind: function() {
            if (this.view) {
                this.view.unbind();
            }
            this.$el.off();
        },
        when: function() {
            return $.when.apply(this, arguments);
        }
    });
});
