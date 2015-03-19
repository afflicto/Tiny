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

	getControllerName: (type) ->
		return Tiny.Util.capitalize(type) + 'Controller'

	# render the given template
	render: (template, model) ->
		@outlet.find('> div').hide()
		element = @outlet.find('div#' + template).show()

		if model?
			# is it a model instance?
			if model instanceof Tiny.Model
				variables = model.attributes
			else 
				variables = model
			
			element.attr('data-tiny-id', variables.id);

			# now put in the values
			for own key, value of variables
				e = element.find('[data-bind="' + key + '"]')
				if e.prop('tagName') == 'input'
					e.val(value)
				else
					e.html(value)

		if @controllers[template]?
			controller = @controllers[template]
		else if window[@getControllerName(template)]?
			@controllers[template] = controller = new window[controller] $(template)

		if controller?
			controller.init() unless controller.initialized
			controller.show(model)