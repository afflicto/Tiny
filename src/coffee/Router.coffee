class Tiny.Router
	rootURL: '',
	current: '/'

	routes: []

	constructor: () ->

	navigate: (path, dontPush = false) ->
		console.log 'navigating to:' + path

		# trim path
		path = path.replace(/^\//, '')
		path = path.replace(/\/$/, '')

		path = '/' if path == ''

		console.log 'path is:' + path + ', searching routes...'

		for route in @routes
			if route.matches(path)
				return route.run(path)

		console.log '404: not found (' + path + ')'

	map: (routes) ->
		for own path, callback of routes
			@routes.push new Tiny.Route(path, callback)

	init: () ->
		console.log 'initializing router...'
		current = window.location.href
		current = current.replace(@rootURL, '')
		current = current.replace('http://', '')

		console.log 'current url: "' + current + '"'

		@navigate(current)

		$(window).bind 'popstate', (e) =>
			console.log 'popstate fired!'
			current = window.location.href
			current = current.replace(@rootURL, '')
			current = current.replace('http://', '')

			@navigate(current, true)