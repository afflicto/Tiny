(function() {
  var hasProp = {}.hasOwnProperty;

  window.Tiny = {};

  Tiny.Util = {};

  Tiny.Util.capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  Tiny.App = (function() {
    App.prototype.outlet = null;

    App.prototype.controllers = {};

    function App(modules) {
      var controller, i, j, len, len1, module, name, template, templates;
      if (modules == null) {
        modules = [];
      }
      Tiny.App.instance = this;
      this.outlet = $('#outlet');
      this.outlet.find('> div').hide();
      for (i = 0, len = modules.length; i < len; i++) {
        module = modules[i];
        this[module.toLowerCase()] = new Tiny[Tiny.Util.capitalize(module)];
      }
      templates = this.outlet.children('div');
      for (j = 0, len1 = templates.length; j < len1; j++) {
        template = templates[j];
        name = $(template).attr('id');
        controller = Tiny.Util.capitalize(name) + 'Controller';
        if (window[controller] != null) {
          this.controllers[name] = new window[controller]($(template));
        }
      }
      $("[data-view]").hide();
    }

    App.prototype.getControllerName = function(type) {
      return Tiny.Util.capitalize(type) + 'Controller';
    };

    App.prototype.render = function(template, model) {
      var controller, e, element, key, value, variables;
      this.outlet.find('> div').hide();
      element = this.outlet.find('div#' + template).show();
      if (model != null) {
        if (model instanceof Tiny.Model) {
          variables = model.attributes;
        } else {
          variables = model;
        }
        element.attr('data-tiny-id', variables.id);
        for (key in variables) {
          if (!hasProp.call(variables, key)) continue;
          value = variables[key];
          e = element.find('[data-bind="' + key + '"]');
          if (e.prop('tagName') === 'input') {
            e.val(value);
          } else {
            e.html(value);
          }
        }
      }
      if (this.controllers[template] != null) {
        controller = this.controllers[template];
      } else if (window[this.getControllerName(template)] != null) {
        this.controllers[template] = controller = new window[controller]($(template));
      }
      if (controller != null) {
        if (!controller.initialized) {
          controller.init();
        }
        return controller.show(model);
      }
    };

    return App;

  })();

}).call(this);

(function() {
  Tiny.Store = (function() {
    Store.prototype.app = null;

    Store.prototype.driver = null;

    Store.prototype.records = {};

    function Store(driver) {
      this.driver = driver;
      this.app = Tiny.App.instance;
    }

    Store.prototype.getType = function(model) {
      return model.constructor.name.replace(/Model$/, '').toLowerCase();
    };

    Store.prototype.save = function(model, callback) {
      var id, type;
      type = this.getType(model);
      if ((this.records[type] != null) === false) {
        this.records[type] = [];
      }
      if (this.driver !== null) {
        this.driver.save(type, model.attributes, (function(_this) {
          return function(id) {
            model.attributes.id = id;
            return callback(id);
          };
        })(this));
      } else {
        id = this.records[type].length + 1;
        model.attributes.id = id;
      }
      return this.records[type].push(model);
    };

    Store.prototype.destroy = function(model, callback) {
      if (this.driver !== null) {
        return this.driver.destroy(this.getType(model), model.attributes.id, (function(_this) {
          return function(success) {
            if (success) {
              _this.records[_this.getType(model)].splice(_this.records[_this.getType(model)].indexOf(model), 1);
            }
            return callback(success);
          };
        })(this));
      } else {
        this.records[this.getType(model)].splice(this.records.indexOf(model), 1);
        return true;
      }
    };

    Store.prototype.find = function(type, id) {
      var data, i, len, record, ref;
      if ((this.records[type] != null) === false) {
        this.records[type] = [];
      }
      ref = this.records[type];
      for (i = 0, len = ref.length; i < len; i++) {
        record = ref[i];
        if (record.attributes.id === id) {
          return record;
        }
      }
      if (this.driver !== null) {
        data = this.driver.find(type, id, (function(_this) {
          return function(record) {
            record = _this.modelize(type, record);
            _this.records[type].push(record);
            return record;
          };
        })(this));
      }
      return null;
    };

    Store.prototype.get = function(type) {
      if ((this.records[type] != null) === false) {
        this.records[type] = [];
      }
      return new Tiny.Collection(this.records[type]);
    };

    Store.prototype.fetch = function(type, page, callback) {
      return this.driver.fetch(type, page, (function(_this) {
        return function(records) {
          var collection, i, len, record;
          collection = new Tiny.Collection();
          _this.records[type] = [];
          for (i = 0, len = records.length; i < len; i++) {
            record = records[i];
            record = _this.modelize(type, record);
            collection.push(record);
            _this.records[type].push(record);
          }
          return callback(collection);
        };
      })(this));
    };

    Store.prototype.modelize = function(type, record) {
      var className;
      className = Tiny.Util.capitalize(type) + 'Model';
      if (window[className] != null) {
        return new window[className](record);
      }
      return {
        attributes: record
      };
    };

    return Store;

  })();

}).call(this);

(function() {
  Tiny.Store.Driver = (function() {
    function Driver() {}

    Driver.prototype.get = function(type, offset, limit, callback) {
      if (offset == null) {
        offset = 0;
      }
      if (limit == null) {
        limit = 20;
      }
    };

    Driver.prototype.find = function(type, id, callback) {};

    Driver.prototype.store = function(type, attributes, callback) {};

    return Driver;

  })();

}).call(this);

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Tiny.Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection(records) {
      var i, len, record;
      if (records == null) {
        records = [];
      }
      Collection.__super__.constructor.apply(this, arguments);
      for (i = 0, len = records.length; i < len; i++) {
        record = records[i];
        this.push(record);
      }
    }

    Collection.prototype.where = function(attr, operator, value) {
      var i, len, record;
      for (i = 0, len = this.length; i < len; i++) {
        record = this[i];
        if (operator === '=' || operator === 'is') {
          if (record.attributes[attr] !== value) {
            continue;
          }
        } else if (operator === '!=') {
          if (record.attributes[attr] !== value) {
            continue;
          }
        } else if (operator === '>') {
          if (record.attributes[attr] > value) {
            continue;
          }
        } else if (operator === '>=') {
          if (record.attributes[attr] >= value) {
            continue;
          }
        } else if (operator === '<') {
          if (record.attributes[attr] < value) {
            continue;
          }
        } else if (operator === '<=') {
          if (record.attributes[attr] <= value) {
            continue;
          }
        }
        this.splice(this.indexOf(record), 1);
      }
      return this;
    };

    Collection.prototype.render = function(target, keep) {
      var i, len, record, results, view;
      if (keep == null) {
        keep = false;
      }
      if (this.length === 0) {
        return target.find('[data-empty]').show();
      } else {
        target.find('[data-empty]').hide();
        view = target.children('li[data-view]:not(.tiny-view-instance)').first();
        if (!keep) {
          target.children('li.tiny-view-instance').remove();
        }
        results = [];
        for (i = 0, len = this.length; i < len; i++) {
          record = this[i];
          results.push(record.render(view).appendTo(target));
        }
        return results;
      }
    };

    return Collection;

  })(Array);

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Tiny.Controller = (function() {
    Controller.prototype.initialized = false;

    Controller.prototype.element = null;

    Controller.prototype.events = {};

    Controller.prototype.eventBindings = [];

    function Controller(element1) {
      var eventBinding, eventType, exp, method, ref, targetElement;
      this.element = element1;
      this.app = Tiny.App.instance;
      console.log('initializing controller:');
      ref = this.events;
      for (exp in ref) {
        if (!hasProp.call(ref, exp)) continue;
        method = ref[exp];
        exp = exp.split(/\s/);
        eventType = exp[0];
        targetElement = this.element.find(exp[1]);
        eventBinding = {
          element: targetElement,
          event: eventType,
          controller: this,
          method: method
        };
        this.eventBindings.push(eventBinding);
        targetElement.data('tiny-event', eventBinding);
        targetElement.bind(eventType, function(e) {
          var binding, element, elements, i, input, len;
          e.preventDefault();
          binding = $(this).data('tiny-event');
          input = {};
          if (binding.event === 'submit') {
            elements = $(this).find('input, textarea, select');
            for (i = 0, len = elements.length; i < len; i++) {
              element = elements[i];
              element = $(element);
              if (element.attr('type') !== 'submit' && element.attr('type') !== 'reset') {
                input[element.attr('name')] = element.val();
              }
            }
            return binding.controller[binding.method](input);
          } else {
            return binding.controller[binding.method]();
          }
        });
        console.log('done.');
      }
    }

    Controller.prototype.init = function() {
      return this.initialized = true;
    };

    Controller.prototype.show = function() {};

    Controller.prototype.hide = function() {};

    return Controller;

  })();

}).call(this);

(function() {
  Tiny.Model = (function() {
    function Model(attributes) {
      var key, value;
      if (attributes == null) {
        attributes = {};
      }
      this.attributes = {
        id: 0
      };
      for (key in attributes) {
        value = attributes[key];
        this.attributes[key] = value;
      }
      this.attributes.id = parseInt(this.attributes.id);
      this.views = [];
    }

    Model.prototype.set = function(attr, value) {
      if (this.attributes[attr] !== value) {
        return this.attributes[attr] = value;
      }
    };

    Model.prototype.save = function(callback) {
      return Tiny.App.instance.store.save(this, (function(_this) {
        return function(id) {
          _this.attributes.id = id;
          return callback(id);
        };
      })(this));
    };

    Model.prototype.destroy = function() {
      return Tiny.App.instance.store.destroy(this, (function(_this) {
        return function(success) {
          var i, len, ref, results, view;
          console.log(success);
          if (success) {
            ref = _this.views;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              view = ref[i];
              results.push(view.remove());
            }
            return results;
          }
        };
      })(this));
    };

    Model.prototype.render = function(view, after) {
      var attr, clone, element, elements, i, len, ref, tag, val;
      if (after == null) {
        after = null;
      }
      view = view.filter(':not(.tiny-view-instance)').first();
      view.hide();
      clone = view.clone().addClass('tiny-view-instance').attr('data-tiny-id', '' + this.attributes.id).attr('data-tiny-model', '' + this.constructor.name).show();
      if (after === null) {
        view.after(clone);
      } else {
        after.after(clone);
      }
      this.views.push(clone);
      ref = this.attributes;
      for (attr in ref) {
        val = ref[attr];
        elements = clone.find('*[data-bind="' + attr + '"]');
        for (i = 0, len = elements.length; i < len; i++) {
          element = elements[i];
          element = $(element);
          tag = element.prop('tagName');
          if (tag === 'input') {
            element.val(this.attributes[attr]);
          } else {
            element.html(this.attributes[attr]);
          }
        }
      }
      return clone;
    };

    return Model;

  })();

}).call(this);

(function() {
  Tiny.Store.RESTDriver = (function() {
    function RESTDriver(apiURL) {
      this.apiURL = apiURL;
      this.apiURL = this.apiURL.replace(/\/$/, '') + '/';
    }

    RESTDriver.prototype.find = function(type, id, callback) {
      return $.get(this.apiURL + type + '/' + id, callback);
    };

    RESTDriver.prototype.fetch = function(type, page, callback) {
      return $.get(this.apiURL + type + '/page/' + page, (function(_this) {
        return function(response) {
          response = $.parseJSON(response);
          return callback(response.records);
        };
      })(this));
    };

    RESTDriver.prototype.save = function(type, attributes, callback) {
      return $.post(this.apiURL + type, attributes, (function(_this) {
        return function(response) {
          response = $.parseJSON(response);
          return callback(response.id);
        };
      })(this));
    };

    RESTDriver.prototype.destroy = function(type, id, callback) {
      return $.get(this.apiURL + type + '/delete/' + id, (function(_this) {
        return function(response) {
          response = $.parseJSON(response);
          return callback(response.success);
        };
      })(this));
    };

    return RESTDriver;

  })();

}).call(this);

(function() {
  Tiny.Route = (function() {
    Route.prototype.signature = '/';

    Route.prototype.target = null;

    Route.prototype.segments = [];

    Route.prototype.path = [];

    Route.prototype["arguments"] = [];

    function Route(signature, target) {
      var j, len, ref, segment;
      this.signature = signature;
      this.target = target;
      if (this.signature === '/') {
        return;
      }
      this.segments = this.signature.split('/');
      ref = this.segments;
      for (j = 0, len = ref.length; j < len; j++) {
        segment = ref[j];
        if (segment === '') {
          continue;
        }
        if (/:[^:]*/.test(segment)) {
          this["arguments"].push(segment);
        } else {
          this.path.push(segment);
        }
      }
      console.log(this);
    }

    Route.prototype.extractParameters = function(uri) {
      var index, j, len, param, params, ref, segment;
      params = [];
      index = 0;
      uri = uri.split('/');
      ref = this.segments;
      for (j = 0, len = ref.length; j < len; j++) {
        segment = ref[j];
        if (/:[^:]*/.test(segment)) {
          if ((uri[index] != null) === false) {
            return params;
          } else {
            param = uri[index];
            if (/[0-9]+/.test(param)) {
              param = parseInt(param);
            } else if (/[0-9\.]+/.test(param)) {
              param = parseFloat(param);
            }
            params.push(param);
          }
        }
        index++;
      }
      return params;
    };

    Route.prototype.matches = function(uri) {
      var i, j, len, ref, segment;
      if (this.signature === '/' && uri === '/') {

      } else if (this.signature === '/') {
        return false;
      }
      if (this.signature === uri) {
        return true;
      }
      uri = uri.split('/');
      console.log(uri);
      if (uri.length > this.segments.length) {
        return false;
      }
      i = 0;
      ref = this.segments;
      for (j = 0, len = ref.length; j < len; j++) {
        segment = ref[j];
        if (/:[^:]*/.test(segment)) {
          if (/:[^:?]?/.test(segment)) {
            i++;
            continue;
          } else if (uri[i] != null) {
            i++;
            continue;
          }
        } else {
          if ((uri[i] != null) === false) {
            return false;
          } else if (uri[i] !== segment) {
            return false;
          }
          i++;
          continue;
        }
        return false;
      }
      return true;
    };

    Route.prototype.run = function(uri, dontPush) {
      var params;
      if (dontPush == null) {
        dontPush = false;
      }
      params = this.extractParameters(uri);
      if (typeof this.target === 'string') {
        return Tiny.App.instance.router.navigate(this.target);
      } else {
        if (!dontPush) {
          history.pushState(this.signature, this.signature, '/' + Tiny.App.instance.router.rootURL + '/' + uri);
        }
        return this.target.apply(this.target, params);
      }
    };

    return Route;

  })();

}).call(this);

(function() {
  var hasProp = {}.hasOwnProperty;

  Tiny.Router = (function() {
    Router.prototype.rootURL = '';

    Router.prototype.current = '/';

    Router.prototype.routes = [];

    function Router() {}

    Router.prototype.navigate = function(path, dontPush) {
      var i, len, ref, route;
      if (dontPush == null) {
        dontPush = false;
      }
      path = path.replace(/^\//, '');
      path = path.replace(/\/$/, '');
      if (path === '') {
        path = '/';
      }
      ref = this.routes;
      for (i = 0, len = ref.length; i < len; i++) {
        route = ref[i];
        if (route.matches(path)) {
          return route.run(path, dontPush);
        }
      }
      return this.notFound.apply(this, [path]);
    };

    Router.prototype.setRootURL = function(url) {
      return this.rootURL = url.replace(/^\//, '').replace(/\/$/, '');
    };

    Router.prototype.map = function(routes) {
      var callback, path, results;
      results = [];
      for (path in routes) {
        if (!hasProp.call(routes, path)) continue;
        callback = routes[path];
        results.push(this.routes.push(new Tiny.Route(path, callback)));
      }
      return results;
    };

    Router.prototype.getCurrentPath = function() {
      return window.location.pathname.replace(this.rootURL, '').replace(/\/{2,}/, '');
    };

    Router.prototype.init = function() {
      var path;
      path = this.getCurrentPath();
      this.navigate(path);
      return $(window).bind('popstate', (function(_this) {
        return function(e) {
          path = _this.getCurrentPath();
          return _this.navigate(path, true);
        };
      })(this));
    };

    return Router;

  })();

}).call(this);
