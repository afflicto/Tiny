class Tiny.Collection extends Array
	constructor: (records = []) ->
		super
		@push record for record in records

	where: (attr, operator, value) ->
		for record in @
			if operator is '=' or operator is 'is'
				if record.attributes[attr] != value
					continue
			else if operator is '!='
				if record.attributes[attr] != value
					continue
			else if operator is '>'
				if record.attributes[attr] > value
					continue
			else if operator is '>='
				if record.attributes[attr] >= value
					continue
			else if operator is '<'
				if record.attributes[attr] < value
					continue
			else if operator is '<='
				if record.attributes[attr] <= value
					continue
			# remove it
			@splice(@indexOf(record), 1)

		return @

	render: (target, keep = false) ->
		if @length == 0
			target.find('[data-empty]').show()
		else
			target.find('[data-empty]').hide()
			view = target.children('li[data-view]:not(.tiny-view-instance)').first()

			unless keep then target.children('li.tiny-view-instance').remove()

			for record in @
				record.render(view).appendTo target