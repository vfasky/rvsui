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
                content: ''
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
                '<div role="yes" class="ui green button">确认</div>'
            );
        }
    });

    Window.alert = function(content, callback, title){
        title = title || '提示信息';
        callback = callback || function(){};

        if(!Window._alert){
            Window._alert = new Window({
                title: title,
                content: content
            });
        }
        else{
            Window._alert.off('hide');
            Window._alert.off('ok');
            Window._alert.setTitle(title);
            Window._alert.setContent(content);
        }

        Window._alert.on('hide', function(){
            callback(false);
        });

        Window._alert.on('ok', function(){
            callback(true);
        });

        Window._alert.show();

        return Window._alert;
    };


    return Window;
});
