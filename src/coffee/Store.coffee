# when you get something, you receive a 'chunk'.
class Tiny.Store
	app: null
	driver: null
	records: {}

	constructor: (@driver) ->
		@app = Tiny.App.instance

	getType: (model) ->
		return model.constructor.name.replace(/Model$/, '').toLowerCase()

	save: (model, callback) ->
		type = @getType(model)

		if @records[type]? == false
			@records[type] = []

		if @driver isnt null
			@driver.save type, model.attributes, (id) =>
				model.attributes.id = id
				callback(id)
		else
			id = @records[type].length + 1
			model.attributes.id = id
		@records[type].push model

	destroy: (model, callback) ->
		if @driver isnt null
			@driver.destroy(@getType(model), model.attributes.id, (success) =>
				if success
					@records[@getType(model)].splice(@records[@getType(model)].indexOf(model), 1)
				callback success
			)

		else
			@records[@getType(model)].splice(@records.indexOf(model), 1)
			return true

	# find a model by id
	find: (type, id) ->
		if @records[type]? == false
			@records[type] = []

		for record in @records[type]
			if record.attributes.id == id
				return record

		if @driver isnt null
			data = @driver.find type, id, (record) =>
				record = @modelize type, record
				@records[type].push record
				return record

		return null

	get: (type) ->
		if @records[type]? == false
			@records[type] = []

		return new Tiny.Collection @records[type]

	fetch: (type, page, callback) ->
		@driver.fetch type, page, (records) =>
			collection = new Tiny.Collection()

			@records[type] = []

			# get records
			for record in records
				record = @modelize(type, record)
				collection.push record
				@records[type].push record

			# run callback with collection
			callback(collection)

	modelize: (type, record) ->
		className = Tiny.Util.capitalize(type) + 'Model'

		if window[className]?
			return new window[className](record)
		return {attributes: record}