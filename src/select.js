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
