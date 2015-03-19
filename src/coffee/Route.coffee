class Tiny.Route
	signature: '/' # the raw path signature, as a string
	target: null # the target
	segments: [] # entire path as array
	path: [] # the path, without arguments
	arguments: [] # argument signature

	constructor: (@signature, @target) ->
		# is this the root path?
		if @signature is '/'
			return

		# split up the path into segments
		@segments = @signature.split '/'

		# get segments
		for segment in @segments
			if segment is ''
				continue
			
			if /:[^:]*/.test segment
				# arguments
				@arguments.push(segment)
			else
				@path.push(segment)
			

		console.log @


	matches: (uri) ->
		# is it the root url?
		if @signature == '/' && uri == '/'
		else if @signature == '/'
			return false

		# are they simply the same?
		if @signature == uri
			return true

		# Then we're dealing with a route with arguments...

		uri = uri.split('/')
		console.log uri

		# make sure uri doesn't have more segments than possible
		if uri.length > @segments.length
			return false

		i = 0
		for segment in @segments
			# is this an argument?
			if /:[^:]*/.test segment
				# is it optional?
				if /:[^:?]?/.test segment
					i++
					continue
				# make sure it exists
				else if uri[i]?
					i++
					continue
			else
				# does it exist?
				if uri[i]? == false
					return false
				else if uri[i] != segment
					return false
				i++
				continue
			return false

		return true

	run: (uri) ->
		if typeof @target == 'string'
			Tiny.App.instance.router.navigate(@target)
		else
			history.pushState(@signature, '', uri)
			@target()


# notes/:type/:num?
# notes/cake/3