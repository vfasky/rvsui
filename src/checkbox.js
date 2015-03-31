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
