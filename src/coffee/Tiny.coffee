window.Tiny = {};

Tiny.Util = {}
Tiny.Util.capitalize = (string) ->
	string.charAt(0).toUpperCase() + string.slice(1);

class Tiny.App
	outlet: null
	controllers: {}

	constructor: (modules = []) ->
		Tiny.App.instance = @

		# get outlet element
		@outlet = $ '#outlet'

		# hide all templates
		@outlet.find('> div').hide()

		# initialize modules
		for module in modules
			this[module.toLowerCase()] = new Tiny[Tiny.Util.capitalize(module)]

		# initialize controllers
		templates = @outlet.children 'div'
		for template in templates
			name = $(template).attr 'id'
			controller = Tiny.Util.capitalize(name) + 'Controller'
			if window[controller]?
				@controllers[name] = new window[controller] $(template)

		# hide all views by default
		$("[data-view]").hide()

	# render the given template to the outlet
	render: (template, variables...) ->
		console.log('rendering template: ' + template)
		@outlet.find('> div').hide()
		@outlet.find('div#' + template)
			.show()

		if @controllers[template]?
			controller = @controllers[template]
			controller.init() unless controller.initialized
			controller.show()