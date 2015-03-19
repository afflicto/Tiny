class Tiny.Router
	rootURL: '',
	current: '/'

	routes: []

	constructor: () ->

	navigate: (path, dontPush = false) ->
		# trim path
		path = path.replace(/^\//, '')
		path = path.replace(/\/$/, '')
		path = '/' if path == ''

		for route in @routes
			if route.matches(path)
				return route.run(path, dontPush)

		return @notFound.apply(this, [path])

	setRootURL: (url) ->
		@rootURL = url.replace(/^\//, '').replace(/\/$/, '')

	map: (routes) ->
		for own path, callback of routes
			@routes.push new Tiny.Route(path, callback)

	getCurrentPath: () ->
		return window.location.pathname.replace(@rootURL, '').replace(/\/{2,}/, '')

	init: () ->
		path = @getCurrentPath()

		@navigate(path)

		$(window).bind 'popstate', (e) =>
			path = @getCurrentPath()

			@navigate(path, true)