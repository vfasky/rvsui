/**
 * APP
 * @date 2015-03-26 16:02:10
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/app', ['jquery', 'stapes', 'rvsui/route'], function($, stapes, route){
    "use strict";
    
    return stapes.subclass({
        constructor: function($el, options){
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
        route: function(path, viewName){
            var self = this;
            route(path, function(){
                self.runView(viewName, arguments);
            });
            return this;
        },
        run: function(){
            route.reload();
        },
        /**
         * 调度view
         *
         * @param {String} viewName - view 名称
         * @param {Array} args - 参数名
         * @return {Void}
         */
        runView: function(viewName, args){
            var self = this;
            if(this._view){
                if(this._view.name === viewName){
                    this._view.instantiate.run.apply(null, args);
                    return;
                }
                else{
                    this._view.instantiate.destroy();
                }
            }

            require([viewName], function(View){
                var $el = $('<div class="'+ self.options.viewClass +'"></div>');
                var view = {
                    name: viewName,
                    instantiate: new View($el, self)
                };
                self.view = view;
                view.instantiate.run.apply(null, args);
                view.instantiate.$el.appendTo(self.$el);
            });

        }
    });
    
});

;
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

;
define('rvsui/route', [], function() {
    "use strict";
    
    /*!
     * routie - a tiny hash router
     * v0.3.2
     * http://projects.jga.me/routie
     * copyright Greg Allen 2013
     * MIT License
     */
    return (function(w) {

        var routes = [];
        var map = {};

        var Route = function(path, name) {
            this.name = name;
            this.path = path;
            this.keys = [];
            this.fns = [];
            this.params = {};
            this.regex = pathToRegexp(this.path, this.keys, false, false);

        };

        Route.prototype.addHandler = function(fn) {
            this.fns.push(fn);
        };

        Route.prototype.removeHandler = function(fn) {
            for (var i = 0, c = this.fns.length; i < c; i++) {
                var f = this.fns[i];
                if (fn == f) {
                    this.fns.splice(i, 1);
                    return;
                }
            }
        };

        Route.prototype.run = function(params) {
            for (var i = 0, c = this.fns.length; i < c; i++) {
                this.fns[i].apply(this, params);
            }
        };

        Route.prototype.match = function(path, params) {
            var m = this.regex.exec(path);

            if (!m) return false;


            for (var i = 1, len = m.length; i < len; ++i) {
                var key = this.keys[i - 1];

                var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

                if (key) {
                    this.params[key.name] = val;
                }
                params.push(val);
            }

            return true;
        };

        Route.prototype.toURL = function(params) {
            var path = this.path;
            for (var param in params) {
                path = path.replace('/:' + param, '/' + params[param]);
            }
            path = path.replace(/\/:.*\?/g, '/').replace(/\?/g, '');
            if (path.indexOf(':') != -1) {
                throw new Error('missing parameters for url: ' + path);
            }
            return path;
        };

        var pathToRegexp = function(path, keys, sensitive, strict) {
            if (path instanceof RegExp) return path;
            if (path instanceof Array) path = '(' + path.join('|') + ')';
            path = path
                .concat(strict ? '' : '/?')
                .replace(/\/\(/g, '(?:/')
                .replace(/\+/g, '__plus__')
                .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
                    keys.push({
                        name: key,
                        optional: !!optional
                    });
                    slash = slash || '';
                    return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
                })
                .replace(/([\/.])/g, '\\$1')
                .replace(/__plus__/g, '(.+)')
                .replace(/\*/g, '(.*)');
            return new RegExp('^' + path + '$', sensitive ? '' : 'i');
        };

        var addHandler = function(path, fn) {
            var s = path.split(' ');
            var name = (s.length == 2) ? s[0] : null;
            path = (s.length == 2) ? s[1] : s[0];

            if (!map[path]) {
                map[path] = new Route(path, name);
                routes.push(map[path]);
            }
            map[path].addHandler(fn);
        };

        var routie = function(path, fn) {
            if (typeof fn == 'function') {
                addHandler(path, fn);
                //routie.reload();
            } else if (typeof path == 'object') {
                for (var p in path) {
                    addHandler(p, path[p]);
                }
                //routie.reload();
            } else if (typeof fn === 'undefined') {
                routie.navigate(path);
            }
        };

        routie.lookup = function(name, obj) {
            for (var i = 0, c = routes.length; i < c; i++) {
                var route = routes[i];
                if (route.name == name) {
                    return route.toURL(obj);
                }
            }
        };

        routie.remove = function(path, fn) {
            var route = map[path];
            if (!route)
                return;
            route.removeHandler(fn);
        };

        routie.removeAll = function() {
            map = {};
            routes = [];
        };

        routie.navigate = function(path, options) {
            options = options || {};
            var silent = options.silent || false;

            if (silent) {
                removeListener();
            }
            setTimeout(function() {
                window.location.hash = path;

                if (silent) {
                    setTimeout(function() {
                        addListener();
                    }, 1);
                }

            }, 1);
        };

        var getHash = function() {
            return window.location.hash.substring(1);
        };

        var checkRoute = function(hash, route) {
            var params = [];
            if (route.match(hash, params)) {
                route.run(params);
                return true;
            }
            return false;
        };

        var hashChanged = routie.reload = function() {
            var hash = getHash();
            for (var i = 0, c = routes.length; i < c; i++) {
                var route = routes[i];
                if (checkRoute(hash, route)) {
                    return;
                }
            }
        };

        var addListener = function() {
            if (w.addEventListener) {
                w.addEventListener('hashchange', hashChanged, false);
            } else {
                w.attachEvent('onhashchange', hashChanged);
            }
        };

        var removeListener = function() {
            if (w.removeEventListener) {
                w.removeEventListener('hashchange', hashChanged);
            } else {
                w.detachEvent('onhashchange', hashChanged);
            }
        };
        addListener();

        return routie;

    })(window);
});

;
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

;
/**
 * rvsui pack 
 * @date 2015-03-29 22:12:53
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui', ['rvsui/app', 'rvsui/view'], function(App, View){
    "use strict";
    
    return {
        App: App,
        View: View
    }; 
});
