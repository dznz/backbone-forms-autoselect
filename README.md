backbone-forms-autoselect
=========================

A backbone-forms editor that wraps jQuery's [Autocomplete](http://jqueryui.com/autocomplete/) 
library to provide a delicious autocompleting select box for your forms.

Example
-------

    var User = Backbone.Model.extend({
      schema: {
        title: {
          type: 'AutoSelect',
          sourceUrl: "/test/manual_test_data.json",
          itemTemplate: itemTemplate,
          minLength: 3,
          autoselectBlurTimeout: 200
        }
      }
    })
