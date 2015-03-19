class Tiny.Controller
	initialized: false
	element: null
	events: {}
	eventBindings: []

	constructor: (@element) ->
		@app = Tiny.App.instance
		console.log 'initializing controller:'

		# bind events
		for own exp, method of @events
			exp = exp.split(/\s/)
			eventType = exp[0]
			targetElement = @element.find(exp[1])


			eventBinding = 
				element: targetElement
				event: eventType
				controller: @
				method: method

			@eventBindings.push eventBinding
			targetElement.data 'tiny-event', eventBinding

			targetElement.bind eventType, (e) ->
				e.preventDefault()
				binding = $(this).data('tiny-event');
				input = {}
				if binding.event == 'submit'
					elements = $(this).find 'input, textarea, select'
					for element in elements
						element = $(element)
						if element.attr('type') != 'submit' and element.attr('type') != 'reset'
							input[element.attr 'name'] = element.val()

					binding.controller[binding.method](input)
				else
					binding.controller[binding.method]()

			console.log 'done.'


	init: () ->
		@initialized = true

	show: () ->

	hide: () ->
