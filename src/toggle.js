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
