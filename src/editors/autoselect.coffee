((Form) ->
  
  ###
  AutoSelect editor
  
  Text field editor that uses JQuery autocomplete functionality
  
  Special options:
  @param {String} [options.schema.sourceUrl]         Url to use to populate select list.
  @param {String} [options.schema.itemTemplate]      Template to use when populating select list.
  @param {String} [options.schema.minLength]         The minimum number of characters that should be present before searching
  @param {String} [options.autoselectBlurTimeout]    Timout period before validate is called on blur
  ###
  Form.editors.AutoSelect = Form.editors.Text.extend(
    defaultValue:
      id: null
      title: ""

    events:
      keypress: "onBlur"
      blur: "onBlur"

    onKeypress: (event) ->
      event.preventDefault()  if event.keyCode is 13
      true

    # When the user's focus moves off the editor or they stop typing, check that
    # they have left the editor in a valid state.
    onBlur: (event) ->
      setTimeout (=>
        @handleValidation()
      ), @blurTimeout
      true

    initialize: (options) ->
      options = options or {}
      Form.editors.Text::initialize.call this, options
      @blurTimeout = options.autoselectBlurTimeout or @constructor.blurTimeout
      
      # Schema defaults
      @schema = _.extend(
        minLength: 2
      , options.schema or {})

      # Initialise jQuery's Autocomplete widget on our text editor
      @$el.autocomplete
        source: (request, callback) =>
          @handleSearch request, callback

        minLength: @schema.minLength

        focus: (event, ui) =>
          @$el.val ui.item.title
          false

        select: (event, ui) =>
          @selectItem event, ui

        search: (event, ui) =>
          @deselectValue()

      # If we've provided an `itemTemplate` to use for each list item
      # then we ensure that the Autocomplete widget knows to use it when
      # it gets back a collection of items
      if @schema.itemTemplate
        @$el.data("autocomplete")._renderItem = (parent, item) =>
          html = @schema.itemTemplate.render(item)
          $(html).data("item.autocomplete", item).appendTo parent

    # Callback for fetching search results from the server
    handleSearch: (request, callback) ->
      # Set a stylable class to indicate we are loading results
      @$el.addClass "autocomplete-loading"
      $.getJSON @sourceUrl,
        search:
          q: request.term
      , (data, status, jqXHR) =>
        # Once the items have been returned remove the loading class and
        # trigger the callback (see the Autocomplete docs for more details)
        items = data.items
        @$el.removeClass "autocomplete-loading"
        callback items

    sourceUrl: -> @schema?.sourceUrl or ''

    # Mark one of the select items as selected and optionally trigger a callback
    selectItem: (event, ui) ->
      @setValue ui.item
      @options.select event, ui, @$el if @options.select
      false

    getValue: ->
      @selectedValue

    # Set the editor's value to the selected item and display the item's name in
    # the select box.
    setValue: (item) ->
      @selectedValue = item.id
      # Also use jQuery's `data` method to set the value
      @$el
        .data("autocompleteSelected", item.id)
        .addClass("autocomplete-selected")
        .val(@formatItemText(item))
      # Display the full title on rollover
      @$el.attr 'title', @getItemText(item)
      @handleValidation()

    # Prepare a selected item's name for truncated display
    formatItemText: (item) ->
      value = $.trim @getItemText(item)
      value = value.substring(0, 32).trim(this) + "..."  if value.length > 32
      value

    getItemText: (item) -> item.title

    # Mark the element with an error class if validation has failed, and unmark
    # it if it subsequently passes.
    handleValidation: ->
      if @$el.val() and (@selectedValue is null)
        @$el.addClass "autocomplete-error"
      else
        @$el.removeClass "autocomplete-error"
      true

    # Unset the editor's selected state
    deselectValue: ->
      @selectedValue = null
      @$el
        .data("autocompleteSelected", null)
        .removeClass "autocomplete-selected"
  ,
    
    #STATICS
    blurTimeout: 150
  )
) Backbone.Form
