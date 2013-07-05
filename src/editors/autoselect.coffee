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

    onBlur: (event) ->
      setTimeout (=>
        @handleValidation()
      ), @blurTimeout
      true

    initialize: (options) ->
      options = options or {}
      Form.editors.Text::initialize.call this, options
      @blurTimeout = options.autoselectBlurTimeout or @constructor.blurTimeout
      
      #Schema defaults
      @schema = _.extend(
        minLength: 2
      , options.schema or {})
      @$el.autocomplete
        source: (request, callback) =>
          @handleSearch request, callback

        minLength: @schema.minLength
        focus: (event, ui) =>
          @$el.val ui.item.title
          false

        select: (event, ui) =>
          @setValue ui.item
          @options.select event, ui, @$el  if @options.select
          false

        search: (event, ui) =>
          @deselectValue()

      if @schema.itemTemplate
        @$el.data("autocomplete")._renderItem = (parent, item) =>
          html = @schema.itemTemplate.render(item)
          $(html).data("item.autocomplete", item).appendTo parent

    handleSearch: (request, callback) ->
      @$el.addClass "autocomplete-loading"
      $.getJSON @schema.sourceUrl,
        search:
          q: request.term
      , (data, status, jqXHR) =>
        items = data.items
        @$el.removeClass "autocomplete-loading"
        callback items


    getValue: ->
      @selectedValue

    setValue: (item) ->
      @selectedValue = item.id
      value = $.trim(item.title)
      value = value.substring(0, 32).trim(this) + "..."  if value.length > 32
      @$el.data("autocompleteSelected", item.id).addClass("autocomplete-selected").val value
      @handleValidation()

    handleValidation: ->
      if @$el.val() and (@selectedValue is null)
        @$el.addClass "autocomplete-error"
      else
        @$el.removeClass "autocomplete-error"
      true

    deselectValue: ->
      @selectedValue = null
      @$el.data("autocompleteSelected", null).removeClass "autocomplete-selected"
  ,
    
    #STATICS
    blurTimeout: 150
  )
) Backbone.Form
