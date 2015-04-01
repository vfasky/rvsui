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
        "use strict";
        
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
 * loading 
 * @date 2015-04-01 08:16:38
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/loading', ['jquery', 'rvsui/widgetBase'], function($, Widget){
    "use strict";
    
    Widget.reg('loading', Widget.subclass({
        constructor: Widget.prototype.constructor,
        init: function(){
            this.$soure.addClass('ui');

            this.$load = $('<div class="ui active inverted dimmer">'+
                              '<div class="ui active loader" />' +
                           '</div>').hide();

            this.notClass = this.$soure.is('.segment') === false;

            this.$load.appendTo(this.$soure);
        },
        update: function(value){
            if(value){
                this.show();
            }
            else{
                this.hide();
            }
        },
        show: function(){
            this.$load.show();
            if(this.notClass){
                this.$soure.addClass('segment');
            }
        },
        hide: function(){
            this.$load.hide();
            if(this.notClass){
                this.$soure.removeClass('segment');
            }
        }
    })); 
});

;
/**
 * 进度条 
 * @date 2015-04-01 08:35:49
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/progress', ['jquery', 'rvsui/widgetBase'], function($, Widget){
    "use strict";
    
    Widget.reg('progress', Widget.subclass({
        constructor: Widget.prototype.constructor,
        init: function(){
            this.$soure.addClass('ui indicating progress');
            this.$val = $('<div class="bar"><div class="progress" /></div>');
            this.$val.appendTo(this.$soure);

            this.$label = $('<div class="label" />').appendTo(this.$soure);
        },
        update: function(value){
            value = parseInt(value || '0');

            if(value > 100){
                value = 100;
            }

            value = String(value);

            this.$label.html(this.$soure.attr('title') || '');
            
            this.$val.css({
                width: value + '%'
            }).find('.progress').text(value + '%');
        }
    }));
    
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
 * 下拉框
 * @date 2015-03-30 23:20:55
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/select', ['jquery', 'rvsui/widgetBase'], function($, Widget) {
    "use strict";

    var $win = $(window);

    Widget.reg('select', Widget.subclass({
        constructor: Widget.prototype.constructor,
        init: function() {
            this.$soure.hide();
            this.isStatic = this.$soure.attr('data-static') !== undefined;
            this.$el = $('<div class="ui selection dropdown" />');
            this.$label = $('<div class="text" />').appendTo(this.$el);
            this.$el.append('<i class="dropdown icon" />');
            this.$list = $('<div class="menu transition hidden" tabindex="-1" />').appendTo(this.$el);
            this.$label.text(this.$soure.attr('title') || this.$soure.attr('placeholder') || '');

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
        syncList: function() {
            var self = this;
            if (null === this.list || false === this.isStatic) {
                this.list = [];
                this.$list.find('.item').remove();
                var html = '';

                this.$soure.find('option').each(function() {
                    var $el = $(this);
                    var item = {
                        value: $el.val(),
                        text: $el.text()
                    };
                    html += '<div class="item" data-value="' + item.value + '">' +
                        item.text +
                        '</div>';

                    self.list.push(item);
                });

                this.$list.html(html);
            }

            return this.list;
        },
        update: function(value) {
            this.$soure.val(value);

            this.$list.find('.selected').attr('class', 'item');
            if (value) {
                var $el = this.$list.find('[data-value=' + value + ']')
                    .attr('class', 'item active selected');

                if ($el.length > 0) {
                    this.$label.text($el.text());
                }
            }
        },
        showList: function() {
            this.$el.attr('class', 'ui selection dropdown active visible');
            this.$list.attr('class', 'menu transition visible');
        },
        hideList: function() {
            this.$el.attr('class', 'ui selection dropdown');
            this.$list.attr('class', 'menu transition hidden');
        },
        watch: function() {
            var self = this;
            this.$el.on('click', function() {
                self.showList();
                self.syncList();

                if (false === self.isStatic) {
                    self.update(self.getValue());
                }

                return false;
            }).on('click', '.item', function() {
                var $el = $(this);
                var value = $el.attr('data-value');
                self.sync(value);
                self.hideList();
                self.$soure.trigger('change');

                return false;
            });

            $win.on('click.rvsuiSelect' + this.id, function() {
                self.hideList();
            });
        },
        destroy: function() {
            this.$el.remove();
            $win.off('click.rvsuiSelect' + this.id);
        }
    }));
});

;
(function() {
  // Public sightglass interface.
  function sightglass(obj, keypath, callback, options) {
    return new Observer(obj, keypath, callback, options)
  }

  // Batteries not included.
  sightglass.adapters = {}

  // Constructs a new keypath observer and kicks things off.
  function Observer(obj, keypath, callback, options) {
    this.options = options || {}
    this.options.adapters = this.options.adapters || {}
    this.obj = obj
    this.keypath = keypath
    this.callback = callback
    this.objectPath = []
    this.parse()

    if (isObject(this.target = this.realize())) {
      this.set(true, this.key, this.target, this.callback)
    }
  }

  // Tokenizes the provided keypath string into interface + path tokens for the
  // observer to work with.
  Observer.tokenize = function(keypath, interfaces, root) {
    var tokens = []
    var current = {i: root, path: ''}
    var index, chr

    for (index = 0; index < keypath.length; index++) {
      chr = keypath.charAt(index)

      if (!!~interfaces.indexOf(chr)) {
        tokens.push(current)
        current = {i: chr, path: ''}
      } else {
        current.path += chr
      }
    }

    tokens.push(current)
    return tokens
  }

  // Parses the keypath using the interfaces defined on the view. Sets variables
  // for the tokenized keypath as well as the end key.
  Observer.prototype.parse = function() {
    var interfaces = this.interfaces()
    var root, path

    if (!interfaces.length) {
      error('Must define at least one adapter interface.')
    }

    if (!!~interfaces.indexOf(this.keypath[0])) {
      root = this.keypath[0]
      path = this.keypath.substr(1)
    } else {
      if (typeof (root = this.options.root || sightglass.root) === 'undefined') {
        error('Must define a default root adapter.')
      }

      path = this.keypath
    }

    this.tokens = Observer.tokenize(path, interfaces, root)
    this.key = this.tokens.pop()
  }

  // Realizes the full keypath, attaching observers for every key and correcting
  // old observers to any changed objects in the keypath.
  Observer.prototype.realize = function() {
    var current = this.obj
    var unreached = false
    var prev

    this.tokens.forEach(function(token, index) {
      if (isObject(current)) {
        if (typeof this.objectPath[index] !== 'undefined') {
          if (current !== (prev = this.objectPath[index])) {
            this.set(false, token, prev, this.update.bind(this))
            this.set(true, token, current, this.update.bind(this))
            this.objectPath[index] = current
          }
        } else {
          this.set(true, token, current, this.update.bind(this))
          this.objectPath[index] = current
        }

        current = this.get(token, current)
      } else {
        if (unreached === false) {
          unreached = index
        }

        if (prev = this.objectPath[index]) {
          this.set(false, token, prev, this.update.bind(this))
        }
      }
    }, this)

    if (unreached !== false) {
      this.objectPath.splice(unreached)
    }

    return current
  }

  // Updates the keypath. This is called when any intermediary key is changed.
  Observer.prototype.update = function() {
    var next, oldValue

    if ((next = this.realize()) !== this.target) {
      if (isObject(this.target)) {
        this.set(false, this.key, this.target, this.callback)
      }

      if (isObject(next)) {
        this.set(true, this.key, next, this.callback)
      }

      oldValue = this.value()
      this.target = next

      if (this.value() !== oldValue) this.callback()
    }
  }

  // Reads the current end value of the observed keypath. Returns undefined if
  // the full keypath is unreachable.
  Observer.prototype.value = function() {
    if (isObject(this.target)) {
      return this.get(this.key, this.target)
    }
  }

  // Sets the current end value of the observed keypath. Calling setValue when
  // the full keypath is unreachable is a no-op.
  Observer.prototype.setValue = function(value) {
    if (isObject(this.target)) {
      this.adapter(this.key).set(this.target, this.key.path, value)
    }
  }

  // Gets the provided key on an object.
  Observer.prototype.get = function(key, obj) {
    return this.adapter(key).get(obj, key.path)
  }

  // Observes or unobserves a callback on the object using the provided key.
  Observer.prototype.set = function(active, key, obj, callback) {
    var action = active ? 'observe' : 'unobserve'
    this.adapter(key)[action](obj, key.path, callback)
  }

  // Returns an array of all unique adapter interfaces available.
  Observer.prototype.interfaces = function() {
    var interfaces = Object.keys(this.options.adapters)

    Object.keys(sightglass.adapters).forEach(function(i) {
      if (!~interfaces.indexOf(i)) {
        interfaces.push(i)
      }
    })

    return interfaces
  }

  // Convenience function to grab the adapter for a specific key.
  Observer.prototype.adapter = function(key) {
    return this.options.adapters[key.i] ||
      sightglass.adapters[key.i]
  }

  // Unobserves the entire keypath.
  Observer.prototype.unobserve = function() {
    var obj

    this.tokens.forEach(function(token, index) {
      if (obj = this.objectPath[index]) {
        this.set(false, token, obj, this.update.bind(this))
      }
    }, this)

    if (isObject(this.target)) {
      this.set(false, this.key, this.target, this.callback)
    }
  }

  // Check if a value is an object than can be observed.
  function isObject(obj) {
    return typeof obj === 'object' && obj !== null
  }

  // Error thrower.
  function error(message) {
    throw new Error('[sightglass] ' + message)
  }

  // Export module for Node and the browser.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = sightglass
  } else if (typeof define === 'function' && define.amd) {
    define('sightglass', [], function() {
      return this.sightglass = sightglass
    })
  } else {
    this.sightglass = sightglass
  }
}).call(this);


;
/**
 * toggle 开关 
 * @date 2015-03-31 12:43:47
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/toggle', ['jquery', 'rvsui/widgetBase'], function($, Widget){
    "use strict";
    
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
 * 验证
 * @date 2015-03-31 13:57:54
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/validator', ['jquery', 'rvsui/widgetBase'],
    function($, Widget) {
        "use strict";

        /**
         * 验证规则
         *
         * @type {Object}
         */
        var _checkRule = {};


        /**
         * 添加验证规则
         *
         * @param {String} rule
         * @param {Function} fn
         * @return {Void}
         */
        var addRule = function(rule, fn) {
            _checkRule[rule] = fn;
        };

        /**
         * 不能为空
         *
         * @return {Object}
         */
        addRule('required', function($el, msg) {
            msg = msg || '不能为空';
            if (['checkbox', 'radio'].indexOf($el.attr('type')) !== -1) {
                return {
                    status: $el.prop('checked'),
                    msg: msg
                };
            }
            return {
                status: $.trim($el.val()).length > 0,
                msg: msg
            };
        });


        /**
         * 最小长度
         *
         * @return {Object}
         */
        addRule('minlength', function($el, length, msg) {
            msg = msg || '最小' + length + '位字符';
            length = Number(length);
            var value = $.trim($el.val());

            return {
                status: value.length >= length,
                msg: msg
            };
        });

        /**
         * 最大长度
         *
         * @return {Object}
         */
        addRule('maxlength', function($el, length, msg) {
            msg = msg || '最多' + length + '位字符';
            length = Number(length);
            var value = $.trim($el.val());

            return {
                status: value.length <= length,
                msg: msg
            };
        });

        /**
         * 最小值
         *
         * @return {Object}
         */
        addRule('min', function($el, min, msg) {
            msg = msg || '数值要大于' + min;
            min = Number(min);
            var value = parseInt($el.val());

            return {
                status: value >= min,
                msg: msg
            };
        });

        /**
         * 最大值
         *
         * @return {Object}
         */
        addRule('max', function($el, max, msg) {
            msg = msg || '数值要小于' + max;
            max = Number(max);
            var value = parseInt($el.val());

            return {
                status: value <= max,
                msg: msg
            };
        });

        /**
         * 判断两次输入的值是否相符
         *
         * @return {Object}
         */
        addRule('equals', function($el, $eq, msg) {
            msg = msg || '两次输入的值不相符';
            return {
                status: $el.val() === $eq.val(),
                msg: msg
            };
        });

        /**
         * 检查邮箱
         *
         * @return {Object}
         */
        addRule('isEmail', function($el, msg) {
            msg = msg || '邮箱格式不正确';
            var value = $.trim($el.val());
            return {
                status: value.length === 0 || /^(?:[a-z0-9]+[_\-+.]+)*[a-z0-9]+@(?:([a-z0-9]+-?)*[a-z0-9]+.)+([a-z]{2,})+$/i.test(value), 
                msg: msg
            };
        });

        /**
         * 检查日期
         * 仅支持 8 种类型的 day
         * 20120409 | 2012-04-09 | 2012/04/09 | 2012.04.09 | 以上各种无 0 的状况
         * @return {Object}
         */
        addRule('isDate', function($el, msg) {
            msg = msg || '日期格式不正确';
            var value = $.trim($el.val());
            var check = function(text) {
                var reg = /^([1-2]\d{3})([-/.])?(1[0-2]|0?[1-9])([-/.])?([1-2]\d|3[01]|0?[1-9])$/,
                    taste, d, year, month, day;

                if (!reg.test(text)) {
                    return false;
                }

                taste = reg.exec(text);
                year = +taste[1];
                month = +taste[3] - 1;
                day = +taste[5];
                d = new Date(year, month, day);

                return year === d.getFullYear() && month === d.getMonth() && day === d.getDate();
            };

            return {
                status: value.length === 0 || check(value),
                msg: msg
            };
        });

        /**
         * 检查手机
         * 仅中国手机适应；以 1 开头，第二位是 3-9，并且总位数为 11 位数字
         * @return {Object}
         */
        addRule('isMobile', function($el, msg) {
            msg = msg || '手机格式不正确';
            var value = $.trim($el.val());

            return {
                status: value.length === 0 || /^1[3-9]\d{9}$/.test(value),
                msg: msg
            };

        });

        /**
         * 检查座机
         * 座机：仅中国座机支持；区号可有 3、4位数并且以 0 开头；电话号不以 0 开头，最 8 位数，最少 7 位数
         * 但 400/800 除头开外，适应电话，电话本身是 7 位数
         * 0755-29819991 | 0755 29819991 | 400-6927972 | 4006927927 | 800...
         * @return {Object}
         */
        addRule('isTel', function($el, msg) {
            msg = msg || '座机格式不正确';
            var value = $.trim($el.val());

            return {
                status: value.length === 0 || /^(?:(?:0\d{2,3}[- ]?[1-9]\d{6,7})|(?:[48]00[- ]?[1-9]\d{6}))$/.test(value),
                msg: msg
            };

        });

        /**
         * 检查url 
         *
         * @return {Void}
         */
        addRule('isUrl', function($el, msg) {
            msg = msg || 'url 格式不正确';
            var url = (function() {
                var protocols = '((https?|s?ftp|irc[6s]?|git|afp|telnet|smb):\\/\\/)?',
                    userInfo = '([a-z0-9]\\w*(\\:[\\S]+)?\\@)?',
                    domain = '(?:localhost|(?:[a-z0-9]+(?:[-\\w]*[a-z0-9])?(?:\\.[a-z0-9][-\\w]*[a-z0-9])*)*\\.[a-z]{2,})',
                    port = '(:\\d{1,5})?',
                    ip = '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
                    address = '(\\/\\S*)?',
                    domainType = [protocols, userInfo, domain, port, address],
                    ipType = [protocols, userInfo, ip, port, address],
                    rDomain = new RegExp('^' + domainType.join('') + '$', 'i'),
                    rIP = new RegExp('^' + ipType.join('') + '$', 'i');

                return function(text) {
                    return rDomain.test(text) || rIP.test(text);
                };
            })();

            var value = $.trim($el.val());


            return {
                status: value.length === 0 || url(value),
                msg: msg
            };
        });

        addRule('maxLength', _checkRule.maxlength);
        addRule('minLength', _checkRule.minlength);

        /**
         * @example
         * <form rv-validator>
         *     <input type="text" name="email" validator="required 不能为空 | isEmail 邮箱格式不正确 | minlength 6  不能小于6个字符 | maxlength 10 最多只能输10个字符"/>
         *     <input type="text" name="number" validator="required | min 6 | max 10 最大值为10"/>
         *     <input type="text" name="reNumber" validator="equals [name=number] 两次输入的值不相等" />
         * </form>
         *
         * @return {Void}
         */
        Widget.reg('validator', Widget.subclass({
            constructor: Widget.prototype.constructor,
            init: function() {
                var self = this;
                this.$soure.addClass('ui');

                this.initLoading();
                
                this.initRules();

                this.$soure.data('check', function(){
                    return self.check();
                }).data('initRules', function(){
                    return self.initRules();
                }).data('loading', self.loading);
            },
            initLoading: function(){
                var self = this;
                this.$load = $('<div class="ui active inverted dimmer">'+
                                  '<div class="ui active loader" />' +
                               '</div>').hide();
                this.$load.appendTo(this.$soure);

                this.loading = {
                    show: function(){
                        self.$load.show();
                        self.$soure.addClass('segment');
                    },
                    hide: function(){
                        self.$load.hide();
                        self.$soure.removeClass('segment');
                    }
                };
            },
            initRules: function(){
                var self = this;
                this.rules = [];
                this.$validators = this.$soure.find('[validator]');
                this.$validators.each(function() {
                    self.parseValidator($(this));
                });
            },
            watch: function(){
                var self = this;
                this.$soure.on('focus change', '[validator]', function(){
                    var $el = $(this);
                    self.hideError($el);
                }).on('click', '.popup', function(){
                    var $el = $(this);
                    $el.removeClass('visible').addClass('hidden');
                    $el.data('soure').focus();
                    return false;
                });
            },
            getData: function(){
                var data = {};
                this.$soure.serializeArray().forEach(function(v){
                    data[v.name] = v.value;
                });
                return data;
            },
            check: function(){
                var isPass = true;
                var self = this;
                this.loading.show();
                $.each(this.rules, function(k, v){
                    var res = v.rule.apply(null, v.args);
                    if(res.status !== true){
                        isPass = false;
                        self.showError(v.args[0], res.msg);
                        self.loading.hide();
                        return false;
                    }
                });
                return isPass ? this.getData() : false;
            },
            showError: function($el, msg){
                var $tip = this.getErrorTip($el);
                $tip.html(msg);
            },
            hideError: function($el){
                var $tip = $el.data('tip');
                if($tip){
                    $tip.removeClass('visible').addClass('hidden');
                }
            },
            getErrorTip: function($el){
                var $tip = $el.data('tip');
                if(!$tip){
                    $tip = $('<div class="ui red label popup transition bottom left visible" />');

                    $tip.appendTo(this.$soure);
                    $tip.data('soure', $el);
                    $el.data('tip', $tip);
                }
                else{
                    $tip.addClass('visible').removeClass('hidden');
                }
                var $target = $el.data('proxyEl') || $el;
                var offset = $target.offset();
                offset.top += ($el.height() || 20) + 3;
                $tip.css(offset);
                return $tip;
            },
            parseValidator: function($el) {
                var self = this;

                $el.attr('validator').split('|').forEach(function(v) {
                    var args = v.split(' ').filter(function(v) {
                        return $.trim(v).length > 0;
                    });
                    var rule = _checkRule[args[0]];
                    var ruleName = args[0];
                    if (ruleName === 'equals') {
                        args[1] = self.$soure.find(args[1]);
                    }
            
                    args[0] = $el;

                    if (rule) {
                        self.rules.push({
                            rule: rule,
                            args: args
                        });
                    }
                    else{
                        console.log('validator rule: ' +  ruleName + ' undefined !');
                    }
                });
            }
        }));

        return {
            add: addRule
        };
    }
);

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
 * 弹窗 
 * @date 2015-04-01 09:22:56
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui/window', ['jquery', 'stapes'], function($, stapes){
    "use strict";

    var $win = $(window);
    var id = 0;
    
    var Window = stapes.subclass({
        constructor: function(options, $root){
            this.options = $.extend({
                title: '',
                content: '',
                yes: '确认'
            }, options);

            this.id = id++;

            this.$root = $root || $('body');

            this.initDom();
            this.setTitle(this.options.title);
            this.setContent(this.options.content);
            this.watch();
        },
        watch: function(){
            var self = this;
            this.$el.on('click', '[role=close]', function(){
                self.hide();
                return false;
            }).on('click', '[role=yes]', function(){
                self.emit('yes');
                self.hide();
                return false;
            }).on('click', '.modal', function(){
                return false;
            }).on('click', function(){
                self.hide();
                return false;
            }); 

            $win.on('resize.rvsuiWindow' + this.id, function(){
                self.setPosition();
            });
        },
        destroy: function(){
            this.$el.remove();
            $win.off('resize.rvsuiWindow' + this.id);
        },
        setTitle: function(value){
            if($.type(value) === 'string'){
                this.$title.html(value);
            }
            else if(value.appendTo){
                this.$title.children().remove();
                value.appendTo(this.$title);
            }
            this.emit('setTitle', value);
        },
        setContent: function(value){
            if($.type(value) === 'string'){
                this.$content.html(value);
            }
            else if(value.appendTo){
                this.$content.children().remove();
                value.appendTo(this.$console);
            }
            this.emit('setTitle', value);
        },
        setPosition: function(){
            var top = this.$win.height() / 2;
            if(top > $win.height()){
                top = $win.height() / 2 - 25;
            }
            this.$win.css({
                    marginTop: - top
                });
        },
        show: function(){
            this.$el.removeClass('hidden')
                .addClass('visible active');
            
            this.$win.removeClass('hidden')
                .addClass('visible active');

            this.setPosition();

            this.emit('show');
        },
        hide: function(){
            this.$el.removeClass('visible active').addClass('hidden');
            this.$win.removeClass('visible active').addClass('hidden');
            this.emit('hide');
        },
        initDom: function(){
            this.$el = $(
                '<div class="ui dimmer modals page transition hidden">' +
                    '<div class="ui small modal transition hidden">' +
                        '<i role="close" class="close icon" />' +
                        '<div class="header" />' +
                        '<div class="content" />' +
                        '<div class="actions" />' +
                    '</div>' +
                '</div>'
            );

            this.$title = this.$el.find('.header');
            this.$content = this.$el.find('.content');
            this.$actions = this.$el.find('.actions');
            this.$win = this.$el.find('.modal');

            this.initActions();

            this.$el.appendTo(this.$root);
        },
        initActions: function(){
            this.$actions.html(
                '<div role="yes" class="ui green button">' + this.options.yes + '</div>'
            );
        }
    });

    /**
     * alert 弹框
     *
     * @param {String} content
     * @param {Function} callback
     * @param {String} title
     * @return {Window}
     */
    Window.alert = function(content, callback, title){
        title = title || '提示信息';
        callback = callback || function(){};
        var isCall = false;

        if(!Window._alert){
            Window._alert = new Window({
                title: title,
                content: content
            });
        }
        else{
            Window._alert.off('hide');
            Window._alert.off('yes');
            Window._alert.setTitle(title);
            Window._alert.setContent(content);
        }

        Window._alert.on('hide', function(){
            if(isCall === false){
                callback(false);
            }
        });

        Window._alert.on('yes', function(){
            isCall = true;
            callback(true);
        });

        Window._alert.show();

        return Window._alert;
    };

    /**
     * 确认弹窗 
     *
     * @return {Window}
     */
    Window.Confirm = Window.subclass({
        constructor: Window.prototype.constructor,
        watch: function(){
            Window.Confirm.parent.watch.call(this);

            var self = this;
            this.$el.on('click', '[role=no]', function(){
                self.emit('no');
                self.hide();
                return false;
            });
        },
        initActions: function(){
            var yes = this.options.yes || '是';
            var no = this.options.no || '否';

            this.$actions.html(
                '<div role="no" class="ui negative button">'+ no +'</div>' + 
                '<div role="yes" class="ui positive right labeled icon button">' +
                    yes + ' <i class="checkmark icon"></i>'+
                '</div>'
            );
        }
    });

    /**
     * 单实例的确认弹窗
     *
     * @param content
     * @param callback
     * @param title
     * @return {Window}
     */
    Window.confirm = function(content, callback, title){
        callback = callback || function(){};
        title = title || '请确认';
        var isCall = false;

        if(!Window._confirm){
            Window._confirm = new Window.Confirm({
                title: title,
                content: content
            });
        }
        else{
            Window._confirm.off('hide');
            Window._confirm.off('yes');
            Window._confirm.off('no');
            Window._confirm.setTitle(title);
            Window._confirm.setContent(content);
        }

        Window._confirm.on('hide', function(){
            if(false === isCall){
                callback(false);
            }
        });

        Window._confirm.on('yes', function(){
            isCall = true;
            callback(true);
        });

        Window._confirm.on('no', function(){
            isCall = true;
            callback(false);
        });

        Window._confirm.show();
    };


    return Window;
});

;
/**
 * rvsui pack
 * @date 2015-03-29 22:12:53
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui', 
    ['rvsui/app', 'rvsui/view', 'rvsui/window',
     'rvsui/select', 'rvsui/toggle',
     'rvsui/checkbox', 'rvsui/validator', 'rvsui/loading',
     'rvsui/progress'
    ],
    function(App, View, Window) {
        "use strict";

        return {
            App: App,
            View: View,
            Window: Window
        };
    });
