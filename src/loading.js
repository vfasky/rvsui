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
