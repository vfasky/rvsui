/**
 * rvsui pack
 * @date 2015-03-29 22:12:53
 * @author vfasky <vfasky@gmail.com>
 */

define('rvsui', 
    ['rvsui/app', 'rvsui/view', 'rvsui/select', 'rvsui/toggle',
     'rvsui/checkbox', 'rvsui/validator', 'rvsui/loading',
     'rvsui/progress'
    ],
    function(App, View) {
        "use strict";

        return {
            App: App,
            View: View
        };
    });
