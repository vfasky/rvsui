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
