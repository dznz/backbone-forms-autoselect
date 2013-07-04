;(function(Form) {

  /**
   * AutoSelect editor
   * 
   * Text field editor that uses JQuery autocomplete functionality
   *
   * Special options:
   * @param {String} [options.schema.sourceUrl]         Url to use to populate select list.
   * @param {String} [options.schema.itemTemplate]      Template to use when populating select list.
   * @param {String} [options.schema.minLength]         The minimum number of characters that should be present before searching
   * @param {String} [options.autoselectBlurTimeout]    Timout period before validate is called on blur
   */
  Form.editors.AutoSelect = Form.editors.Text.extend({

    defaultValue: {id: null, title: ''},

    events: {
      'keypress': 'onBlur',
      'blur': 'onBlur'
    },

    onKeypress: function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
      }
      return true;
    },

    onBlur: function(event) {
      var _this = this;
      setTimeout( function() {
        _this.handleValidation();
      }, _this.blurTimeout);
      return true;
    },

    initialize: function(options) {
      var _this = this;

      options = options || {};

      Form.editors.Text.prototype.initialize.call(this, options);

      this.blurTimeout = options.autoselectBlurTimeout || this.constructor.blurTimeout;

      //Schema defaults
      this.schema = _.extend({
        minLength: 2
      }, options.schema || {});

      this.$el.autocomplete({
        source: function(request, callback) {
          return _this.handleSearch(request, callback);
        },
        minLength: this.schema.minLength,
        focus: function(event, ui) {
          _this.$el.val(ui.item.title);
          return false;
        },
        select: function(event, ui) {
          _this.setValue(ui.item);
          if(_this.options.select) {
            _this.options.select(event, ui, _this.$el)
          }
          return false;
        },
        search: function(event, ui) {
          _this.deselectValue();
        }
      });

      if (this.schema.itemTemplate) {
        this.$el.data('autocomplete')._renderItem = function(parent, item) {
          var html = _this.schema.itemTemplate.render(item);
          $(html).data("item.autocomplete", item).appendTo(parent)
        };
      }
    },

    handleSearch: function(request, callback) {
      var _this = this;
      _this.$el.addClass('autocomplete-loading');

      $.getJSON(_this.schema.sourceUrl, {search: {q:request.term}}, function(data, status, jqXHR) {
        var items = data.items;
        _this.$el.removeClass('autocomplete-loading');
        callback(items);
      })
    },

    getValue: function() {
      return this.selectedValue
    },

    setValue: function(item) {
      this.selectedValue = item.id;
      var value = $.trim(item.title);
      if(value.length > 32) {
        value = value.substring(0, 32).trim(this) + "...";
      }
      this.$el.data("autocompleteSelected", item.id)
        .addClass('autocomplete-selected')
        .val(value)
      return this.handleValidation();
    },

    handleValidation: function() {
      if(this.$el.val() && (this.selectedValue === null)) {
        this.$el.addClass("autocomplete-error");
      } else {
        this.$el.removeClass("autocomplete-error");
      }
      return true
    },

    deselectValue: function() {
      this.selectedValue = null
      this.$el.data('autocompleteSelected', null)
        .removeClass('autocomplete-selected')
    },

  }, {

    //STATICS
    blurTimeout: 150

  });

})(Backbone.Form);
