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
		path = window.location.href.replace(/https?:\/\//, '')
			.replace(@rootURL, '')
			.replace(/\/{2,/, '/')
			.replace(/^\//, '').replace(/\/$/, '')
			
		path = '/' if path == ''
		return path

	makeURL: (path = "") ->
		# trim url
		path = path.replace(/^\//, '').replace(/\/$/, '')

		# make full url
		return @rootURL + "/" + path

	init: () ->
		path = @getCurrentPath()

		console.log 'current path:' + path

		@navigate(path)

		$(window).bind 'popstate', (e) =>
			path = @getCurrentPath()

			@navigate(path, true)