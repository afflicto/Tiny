#------- controller ---------#
class window.NotesController extends Tiny.Controller
	events: {
		'submit form.create': 'create'
		'click button.more': 'more'
		'click button.next': 'next'
		'click button.previous': 'previous'
	}

	constructor: (@element) ->
		super
		@page = 1

	init: () ->
		super
		@fetch()

	fetch: () ->
		console.log 'fetching'
		collection = @app.store.fetch('note', @page, (collection) =>
			collection.render(@element.find('.notes'))
		)

	more: () ->
		console.log 'loading more results:'
		@page++
		@fetch()

	next: () ->
		@page++
		@fetch()

	previous: () ->
		@page--
		if @page < 1 then $page = 1
		@fetch()

	create: (input) ->
		console.log 'creating note:'
		note = new NoteModel input
		note.save (id) =>
			note.render(@element.find('.note'))



class window.NoteController extends Tiny.Controller
	events: 
		'click button.destroy': 'destroy'

	show: (@model) ->
	
	destroy: () ->
		console.log 'destroying note ' + @model.attributes.id

			
		

#------- models -----------#
class window.NoteModel extends Tiny.Model

	constructor: (attributes = {}) ->
		super
		@attributes =
			id: 0
			text: 'hello'
		@attributes[key] = value for key, value of attributes




#----- create and configure our app -------#
app = new Tiny.App(['router', 'store'])

app.store.driver = new Tiny.Store.RESTDriver('http://home.dev/tiny/');

app.router.setRootURL 'tiny/example/example01'

# Let's create our first route
# the path will be /
# This is just the blank URI. We'll use this as our homepage.
# we will return a simple piece of text
app.router.map
	'/': 'dashboard'
	'dashboard': () ->
		app.render('dashboard')
	'notes': () ->
		app.render('notes')
	'note/:id': (id) ->
		app.render('note', app.store.find('note', id))



# setup navigation events
$("#navigation a").click (e) ->
	console.log 'clicked on link'
	e.preventDefault()
	app.router.navigate($(this).attr('href'))


# init
app.router.init()

window.app = app