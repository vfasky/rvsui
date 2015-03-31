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
         * @return {undefined}
         */
        Widget.reg('validator', Widget.subclass({
            constructor: Widget.prototype.constructor,
            init: function() {
                var $el = this.$soure;
                var self = this;
                this.$validators = $el.find('[validator]');

                this.initRules();

                this.$soure.data('check', function(){
                    return self.check();
                }).data('initRules', function(){
                    return self.initRules();
                });
            },
            initRules: function(){
                var self = this;
                this.rules = [];
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
                $.each(this.rules, function(k, v){
                    var res = v.rule.apply(null, v.args);
                    if(res.status !== true){
                        isPass = false;
                        self.showError(v.args[0], res.msg);
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
