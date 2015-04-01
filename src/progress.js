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
