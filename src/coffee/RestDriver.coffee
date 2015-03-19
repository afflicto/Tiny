class Tiny.Store.RESTDriver
	constructor: (@apiURL) ->
		@apiURL = @apiURL.replace(/\/$/, '') + '/'

	find: (type, id, callback) ->
		$.get(@apiURL + type + '/' + id, callback)

	fetch: (type, page, callback) ->
		$.get(@apiURL + type + '/page/' + page, (response) =>
			response = $.parseJSON response
			callback response.records
		)

	save: (type, attributes, callback) ->
		$.post(@apiURL + type, attributes, (response) =>
			response = $.parseJSON response
			callback response.id
		)

	destroy: (type, id, callback) ->
		$.get(@apiURL + type + '/delete/' + id, (response) =>
			response = $.parseJSON(response)
			callback response.success
		)