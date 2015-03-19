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

	extractParameters: (uri) ->
		params = []
		index = 0
		uri = uri.split '/'
		for segment in @segments
			if /:[^:]*/.test segment
				if uri[index]? == false
					return params
				else
					# parse parameter. We might wanna turn it into an integer of float.
					param = uri[index]
					if /[0-9]+/.test param
						param = parseInt param
					else if /[0-9\.]+/.test param
						param = parseFloat param
					params.push(param)
			index++
		return params


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

	run: (uri, dontPush = false) ->
		params = @extractParameters uri

		if typeof @target == 'string'
			Tiny.App.instance.router.navigate(@target)
		else
			unless dontPush then history.pushState(@signature, @signature, '/' + Tiny.App.instance.router.rootURL + '/' + uri)
			@target.apply(@target, params)