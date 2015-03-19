class Tiny.Model

	constructor: (attributes = {}) ->
		@attributes =
			id: 0

		@attributes[key] = value for key, value of attributes
		@attributes.id = parseInt @attributes.id

		@views = []

	set: (attr, value) ->
		if @attributes[attr] isnt value
			@attributes[attr] = value

	save: (callback) ->
		Tiny.App.instance.store.save this, (id) =>
			@attributes.id = id
			callback(id)

	destroy: () ->
		Tiny.App.instance.store.destroy this, (success) =>
			console.log success
			if success
				view.remove() for view in @views

	render: (view, after = null) ->
		view = view.filter(':not(.tiny-view-instance)').first();
		view.hide()

		clone = view.clone()
			.addClass('tiny-view-instance')
			.attr('data-tiny-id', '' + @attributes.id)
			.attr('data-tiny-model', '' + @.constructor.name)
			.show()

		if after == null then view.after(clone) else after.after(clone)

		@views.push clone

		for attr, val of @attributes
			elements = clone.find('*[data-bind="' + attr + '"]')
			for element in elements
				element = $(element)
				tag = element.prop('tagName')
				if tag is 'input'
					element.val(@attributes[attr])
				else
					element.html(@attributes[attr])
		
		return clone