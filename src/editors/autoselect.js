;(function(Form) {

  Form.editors.AutoSelect = Form.editors.Text.extend({

    initialize: function(options) {
      var _this = this;

      Form.editors.Text.prototype.initialize.call(this, options);

      this.$el.autocomplete({
        source: function(request, callback) {
          return _this.handleSearch(request, callback);
        },
        minLength: 2,
        focus: function(event, ui) {

        },
        select: function(event, ui) {
          return false;
        },
        search: function(event, ui) {
          return false;
        }
      });
    },

    handleSearch: function(request, callback) {
      var _this = this;
      _this.$el.addClass('autocomplete-loading');

      $.getJSON(_this.sourceUrl, {search: {q:request.term}}, function(data, status, jqXHR){
        var items = data.items;
        _this.$el.removeClass('autocomplete-loading');
        callback(items);
      });
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
      if(this.$el.val() && (this.selectedValue == null)) {
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

  });

})(Backbone.Form);
