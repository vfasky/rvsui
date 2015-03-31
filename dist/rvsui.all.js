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
                    this._view.instantiate.run.apply(this._view.instantiate, args);
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
                self._view = view;
                view.instantiate.run.apply(view.instantiate, args);
                view.instantiate.$el.appendTo(self.$el);
            });

        }
    });
    
});

;
/**
 *
 * @date 2015-03-31 13:28:21
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/checkbox', ['jquery', 'rvsui/widgetBase', 'rvsui/toggle'],
    function($, Widget) {
        var Toggle = Widget.get('toggle');

        Widget.reg('checkbox', Toggle.subclass({
            constructor: Toggle.prototype.constructor,
            getClassName: function(){
                return 'ui checkbox';
            }
        }));
    }
);

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
 * 下拉框 
 * @date 2015-03-30 23:20:55
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/select', ['jquery', 'rvsui/widgetBase'], function($, Widget){
    "use strict";
    
    var $win = $(window);

    Widget.reg('select', Widget.subclass({
        constructor: Widget.prototype.constructor,
        init: function(){
            this.$soure.hide();
            this.isStatic = this.$soure.attr('data-static') !== undefined;
            this.$el = $('<div class="ui selection dropdown" />');
            this.$label = $('<div class="text" />').appendTo(this.$el);
            this.$el.append('<i class="dropdown icon" />');
            this.$list = $('<div class="menu transition hidden" tabindex="-1" />').appendTo(this.$el);
            this.$label.text(this.$soure.attr('placeholder') || '');

            this.list = null;
            this.syncList();
            this.$soure.data('proxyEl', this.$el);
            this.$el.insertAfter(this.$soure);
        },
        /**
         * 同步下拉列表
         *
         * @return {Array}
         */
        syncList: function(){
            var self = this;
            if(null === this.list || false === this.isStatic){
                this.list = [];
                this.$list.find('.item').remove();
                var html = '';
                
                this.$soure.find('option').each(function(){
                    var $el = $(this);
                    var item = {
                        value: $el.val(),
                        text: $el.text()
                    };
                    html += '<div class="item" data-value="'+ item.value +'">'+
                                item.text +
                            '</div>';

                    self.list.push(item);
                });

                this.$list.html(html);
            }
            
            return this.list;
        },
        update: function(value){
            this.$soure.val(value);

            this.$list.find('.selected').attr('class', 'item');
            if(value){
                var $el = this.$list.find('[data-value=' + value + ']')
                              .attr('class', 'item active selected');

                if($el.length > 0){
                    this.$label.text($el.text());
                }
            }
        },
        showList: function(){
            this.$el.attr('class', 'ui selection dropdown active visible');
            this.$list.attr('class', 'menu transition visible');
        },
        hideList: function(){
            this.$el.attr('class', 'ui selection dropdown');
            this.$list.attr('class', 'menu transition hidden');
        },
        watch: function(){
            var self = this;
            this.$el.on('click',  function(){
                self.showList();
                self.syncList();

                if(false === self.isStatic){
                    self.update(self.getValue());
                }

                return false;
            }).on('click', '.item', function(){
                var $el = $(this);
                var value = $el.attr('data-value');
                self.sync(value);
                self.hideList();
                self.$soure.trigger('change');
                
                return false;
            });

            $win.on('click.rvsuiSelect' + this.id, function(){
                self.hideList();
            });
        },
        destroy: function(){
            this.$el.remove();
            $win.off('click.rvsuiSelect' + this.id);
        }
    }));
});

;
/**
 * toggle 开关 
 * @date 2015-03-31 12:43:47
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/toggle', ['jquery', 'rvsui/widgetBase'], function($, Widget){
    
    /**
     * @example
     * <input type="radio" rv-toggle="self:value" value="1" title="test"/> 
     *
     * @return {Void}
     */
    Widget.reg('toggle', Widget.subclass({
        constructor: Widget.prototype.constructor,
        getClassName: function(){
            return 'ui toggle checkbox';
        },
        init: function(){
            this.$soure.wrap('<div class="' + this.getClassName() + '"/>');
            this.$el = this.$soure.parent();
            this.$label = $('<label />');

            this.$label.text(this.$soure.attr('title') || '');
            this.$label.appendTo(this.$el);
        },
        update: function(value){
            if(String(value) === String(this.$soure.val())){
                this.$soure.prop('checked', true);
                this.$el.attr('class', this.getClassName() + ' checked');
            }
            else{
                this.$soure.prop('checked', false);
                this.$el.attr('class', this.getClassName());
            }
        },
        watch: function(){
            var self = this;
            this.$el.on('click', function(){
                if(self.$soure.prop('checked')){
                    self.sync('');
                }
                else{
                    self.sync(self.$soure.val());
                }
                self.$soure.trigger('change');
                return false;
            });
        }
    })); 
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
         * 渲染html
         * 注：一个view, 只对应一个html模板
         *
         * @param {String} html - 模板
         * @param {Object} data - {key: promise}, key 将传递到模板中
         * @return {promise}
         */
        renderString: function(html, data){
            var dtd = $.Deferred();
            var self = this;
            data = data || {};

            if (!this.view) {
                this.$el.html(html);
                this.bind();
                this.watch();
            }

            var keys = Object.keys(data);
            if(keys.length === 0){
                dtd.resolve();
            }
            else{
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
            }

            return dtd.promise();
        },
        /**
         * 加载html,并渲染模板
         * 注：一个view, 只对应一个html模板
         *
         * @param {String} uri - 模板路径
         * @param {Object} data - {key: promise}, key 将传递到模板中
         * @return {promise}
         */
        render: function(uri, data) {
            var self = this;

            var dtd = $.Deferred();
            this.loadTpl(uri).done(function(html) {
                self.renderString(html, data)
                    .done(function(){
                        dtd.resolve();
                    }).fail(function() {
                        dtd.reject();
                    });
            });
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

;
/**
 * rvsui pack
 * @date 2015-03-29 22:12:53
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui', 
    ['rvsui/app', 'rvsui/view', 'rvsui/select', 'rvsui/toggle',
     'rvsui/checkbox'],
    function(App, View) {
        "use strict";

        return {
            App: App,
            View: View
        };
    });
