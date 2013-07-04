;(function(Form, Editor) {

  module('AutoSelect');

  module('AutoSelect#initialize');

  test('Default type is text', function() {
    var editor = new Editor().render();

    deepEqual($(editor.el).attr('type'), 'text');
  });

  test('Has an autocomplete', function() {
    var editor = new Editor().render();
    ok($(editor.el).data('autocomplete'));
    var option = editor.$el.autocomplete('option');
    ok(option.source, 'with a source');
    ok(option.focus, 'with a focus');
    ok(option.select, 'with a select');
    ok(option.search, 'with a search');
  });

  test('select event calls out', function() {
    var options = {select: sinon.spy()}
    var editor = new Editor(options).render();
    sinon.stub(editor, 'setValue');

    var ac = editor.$el.data('autocomplete');
    var result = ac.options.select('foo', {item: {id: 1, title: 'foo'}});

    ok(!result, 'select does not propagate');
    ok(editor.setValue.called, 'called setValue');
    ok(options.select.called, 'passed in select was called');
  });

  test('focus event customised', function() {
    var editor = new Editor().render();
    var ac = editor.$el.data('autocomplete');
    var longTitle = (new Array(40)).join('A');

    var result = ac.options.focus('foo', {item: {title: longTitle}});

    deepEqual(result, false, 'focus does not propagate');
    deepEqual(editor.$el.val(), longTitle, 'val changed to title');
  });

  test('search deselects the stored value', function() {
    var editor = new Editor().render();
    var ac = editor.$el.data('autocomplete');
    sinon.stub(editor, 'deselectValue');

    ac.options.search('foo', {});

    ok(editor.deselectValue.called);
  });

  module('AutoSelect#search', {
    setup: function() {
      this.editor = new Editor().render();
      this.callback = sinon.spy();
      this.ajax = sinon.stub($, 'getJSON');
    },

    teardown: function() {
      $.getJSON.restore();
    }
  })

  test('sets loading class when called', function() {

    this.editor.handleSearch({term: 'foo'}, this.callback);

    ok(this.editor.$el.hasClass('autocomplete-loading'));
  });

  test('removes loading class when complete', function() {
    var data = {items: []};
    this.ajax.callsArgWith(2, data);

    this.editor.handleSearch({term: 'foo'}, this.callback);

    ok(!this.editor.$el.hasClass('autocomplete-loading'));
  });

  test('autocomplete-supplied callback is called', function() {
    var items = [];
    var data = {items: items};
    this.ajax.callsArgWith(2, data);

    this.editor.handleSearch({term: 'foo'}, this.callback);

    ok(this.callback.called);
    ok(this.callback.calledWith(items), 'called with data');
  });

  module('AutoSelect#getValue()', {
    setup: function() {
      this.editor = new Editor().render();
    }
  });

  test('Default value', function() {
    deepEqual(this.editor.getValue(), null, 'is null');
  });

  test('When unselected', function() {
    this.editor.selectedValue = null
    this.editor.$el.val('foo')

    deepEqual(this.editor.getValue(), null);
  });

  test('when selected', function() {
    this.editor.setValue({id: 1, title: 'foo'});

    deepEqual(this.editor.getValue(), 1)
  })

  module('AutoSelect#setValue()', {
    setup: function() {
      this.editor = new Editor().render();
      this.item = {id: 1, title: 'foo'};
    }
  });

  test('sets value and text', function() {
    this.editor.setValue(this.item);

    deepEqual(this.editor.$el.val(), this.item.title, 'sets the text');
    deepEqual(this.editor.getValue(), this.item.id, 'sets the id');
  });

  test('sets jQuery autocompleteSelected data value', function() {
    this.editor.setValue(this.item);

    deepEqual(this.editor.$el.data('autocompleteSelected'), this.item.id);
  });

  test('sets selected class', function() {
    this.editor.setValue(this.item);

    ok(this.editor.$el.hasClass('autocomplete-selected'));
  });

  test('truncates long strings', function() {
    this.item.title = (new Array(40)).join('A');
    this.editor.setValue(this.item);

    deepEqual(this.editor.$el.val().length, 35);
  });

  test('trims whitespace', function() {
    this.item.title = 'foo   ';
    this.editor.setValue(this.item);
    deepEqual(this.editor.$el.val(), 'foo');
  });

  test('calls validation', function() {
    sinon.stub(this.editor, 'handleValidation');

    this.editor.setValue(this.item);

    ok(this.editor.handleValidation.called);
  });

  module('AutoSelect#deselectValue()')

  test('unsets the selection', function() {
    var editor = new Editor().render();
    editor.selectedValue = 1;
    editor.$el.data('autocompleteSelected', 1)
    editor.$el.addClass('autocomplete-selected');

    editor.deselectValue();

    deepEqual(editor.selectedValue, null, 'unset selectedValue');
    deepEqual(editor.$el.data('autocompleteSelected'), null, 'unset autocompleteSelected data');
    ok(!editor.$el.hasClass('autocomplete-selected'), 'removes the selected class');
  });

  module('AutoSelect#validation', {
    setup: function() {
      this.editor = new Editor().render();
    }
  });

  test('removes error on empty', function() {
    this.editor.$el.addClass('autocomplete-error');

    this.editor.handleValidation();

    ok(!this.editor.$el.hasClass('autocomplete-error'));
  });

  test('if value not selected', function() {
    this.editor.$el.val('foo')

    this.editor.handleValidation();

    ok(this.editor.$el.hasClass('autocomplete-error'), 'add error class');
  });

  test('removes error class if value selected', function() {
    this.editor.$el.val('foo')
    this.editor.selectedValue = 1

    this.editor.handleValidation();

    ok(!this.editor.$el.hasClass('autocomplete-error'));
  });

  module('AutoSelect#onKeypress()');

  test('keypress bubbles', function() {
    var editor = new Editor().render();

    ok(editor.onKeypress('press'), 'returns true');
  });

  module('AutoSelect#blur');

  asyncTest('blur calls validation', 1, function() {
    var editor = new Editor({autoselectBlurTimeout: 1}).render();
    sinon.stub(editor, 'handleValidation');

    editor.onBlur('blur')

    setTimeout(function() {
      ok(editor.handleValidation.called);
      start();
    }, 2);
  });

})(Backbone.Form, Backbone.Form.editors.AutoSelect);
