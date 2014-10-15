 
// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// Firebase adapter to persist Backbone models.

// Load the application once the DOM is ready, using `jQuery.ready`:
var Notes;

$(function(){

  // Note Model
  // ----------

  // Our basic **Note** model has `title`, `body`, `created_at` and `modified_at` attributes.
  var Note = Backbone.Model.extend({

    // Default attributes for the note item.
    defaults: function() {
      return {
        title: "",
        body: ""
      };
    },

    // Ensure that each note created has `title` and set `created_at`.
    initialize: function() {
      if (!this.get("title")) {
        this.set({"title": this.defaults().title});
      }
      this.set({
        "created_at": new Date()
      });
    },

    // REMOVE
    // Toggle the `done` state of this todo item.
    // toggle: function() {
    //   this.set({done: !this.get("done")});
    // }

  });

  // Note Collection
  // ---------------

  // The collection of notes is backed by *Firebase*.
  var NoteList = Backbone.Firebase.Collection.extend({

    // Reference to this collection's model.
    model: Note,

    // Save all of the notes in a Firebase.
    firebase: new Firebase("https://sweltering-inferno-6969.firebaseio.com/"),

    // REMOVE
    // // Filter down the list of all todo items that are finished.
    // done: function() {
    //   return this.filter(function(todo){ return todo.get('done'); });
    // },

    // // Filter down the list to only todo items that are still not finished.
    // remaining: function() {
    //   return this.without.apply(this, this.done());
    // }
  });

  // Create our global collection of **Notes**.
  Notes = new NoteList;

  // Note Item View
  // --------------

  // The DOM element for a note item...
  var NoteView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#note-template').html()),

    // The DOM events specific to an item.
    events: {
      "dblclick .view"  : "edit",
      // "click a.destroy" : "clear",
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

    // The NoteView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Note** and a **NoteView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'remove', this.remove);
    },

    // Re-render the note.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');
      return this;
    },

    // REMOVE
    // // Toggle the `"done"` state of the model.
    // toggleDone: function() {
    //   this.model.toggle();
    // },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      var value = this.input.val();
      if (!value) {
        this.clear();
      } else {
        this.model.set({title: value});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // REMOVE
    // // Remove the item from the collection.
    // clear: function() {
    //   Notes.remove(this.model);
    // }

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#note-app"),

    // Our template for the line of statistics at the bottom of the app.
    // statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #current-note-title":  "createOnEnter",
      "keypress #current-note-body":  "createOnEnter",
      // "click #clear-completed": "clearCompleted",
      // "click #toggle-all": "toggleAllComplete"
    },

    // At initialization we bind to the relevant events on the `Notes`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting notes that might be saved in *Firebase*.
    initialize: function() {
      this.input = this.$("#new-todo");
      // this.allCheckbox = this.$("#toggle-all")[0];

      this.listenTo(Notes, 'add', this.addOne);
      this.listenTo(Notes, 'reset', this.addAll);
      this.listenTo(Notes, 'all', this.render);

      this.footer = this.$('footer');
      this.main = $('#main');
    },

    // REMOVE
    // // Re-rendering the App just means refreshing the statistics -- the rest
    // // of the app doesn't change.
    // render: function() {
    //   var done = Todos.done().length;
    //   var remaining = Todos.remaining().length;

    //   if (Todos.length) {
    //     this.main.show();
    //     this.footer.show();
    //     this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
    //   } else {
    //     this.main.hide();
    //     this.footer.hide();
    //   }

    //   this.allCheckbox.checked = !remaining;
    // },

    // Add a single note item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(note) {
      var view = new NoteView({model: note});
      this.$("#note-list").append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
      this.$("#todo-list").html("");
      Todos.each(this.addOne, this);
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *Firebase*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Todos.add({title: this.input.val()});
      this.input.val('');
    },

    // REMOVE
    // // Clear all done todo items.
    // clearCompleted: function() {
    //   Todos.done().forEach(function(model) {
    //     Todos.remove(model);
    //   });
    //   return false;
    // },

    // toggleAllComplete: function () {
    //   var done = this.allCheckbox.checked;
    //   Todos.each(function (todo) { todo.set({'done': done}); });
    // }

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
