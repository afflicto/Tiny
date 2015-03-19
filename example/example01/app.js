(function() {
  var app,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.NotesController = (function(superClass) {
    extend(NotesController, superClass);

    NotesController.prototype.events = {
      'submit form.create': 'create',
      'click button.more': 'more',
      'click button.next': 'next',
      'click button.previous': 'previous'
    };

    function NotesController(element) {
      this.element = element;
      NotesController.__super__.constructor.apply(this, arguments);
      this.page = 1;
    }

    NotesController.prototype.init = function() {
      NotesController.__super__.init.apply(this, arguments);
      return this.fetch();
    };

    NotesController.prototype.fetch = function() {
      var collection;
      console.log('fetching');
      return collection = this.app.store.fetch('note', this.page, (function(_this) {
        return function(collection) {
          return collection.render(_this.element.find('.notes'));
        };
      })(this));
    };

    NotesController.prototype.more = function() {
      console.log('loading more results:');
      this.page++;
      return this.fetch();
    };

    NotesController.prototype.next = function() {
      this.page++;
      return this.fetch();
    };

    NotesController.prototype.previous = function() {
      var $page;
      this.page--;
      if (this.page < 1) {
        $page = 1;
      }
      return this.fetch();
    };

    NotesController.prototype.create = function(input) {
      var note;
      console.log('creating note:');
      note = new NoteModel(input);
      return note.save((function(_this) {
        return function(id) {
          return note.render(_this.element.find('.note'));
        };
      })(this));
    };

    return NotesController;

  })(Tiny.Controller);

  window.NoteModel = (function(superClass) {
    extend(NoteModel, superClass);

    function NoteModel(attributes) {
      var key, value;
      if (attributes == null) {
        attributes = {};
      }
      NoteModel.__super__.constructor.apply(this, arguments);
      this.attributes = {
        id: 0,
        text: 'hello'
      };
      for (key in attributes) {
        value = attributes[key];
        this.attributes[key] = value;
      }
    }

    return NoteModel;

  })(Tiny.Model);

  app = new Tiny.App(['router', 'store']);

  app.store.driver = new Tiny.Store.RESTDriver('http://home.dev/tiny/');

  app.router.rootURL = 'home.dev/tiny/example/example01';

  app.router.map({
    '/': 'dashboard',
    'dashboard': function() {
      return app.render('dashboard');
    },
    'notes': function() {
      return app.render('notes');
    },
    'notes/:id': function(id) {
      return app.render('notes').show(id);
    }
  });

  $("#navigation a").click(function(e) {
    console.log('clicked on link');
    e.preventDefault();
    return app.router.navigate($(this).attr('href'));
  });

  app.router.init();

  window.app = app;

}).call(this);
