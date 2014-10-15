var Notes;

//////////////////////////////////// $(function(){

  // Note Model
  // ----------

  // Our basic **Note** model has `title`, `body` and `created_at` attributes.
  var Note = Backbone.Model.extend({

    // Default attributes for the note item.
    defaults: {
      title: "",
      body: ""
    },

    // Ensure that each note created has `title` and set `created_at`.
    initialize: function() {
      this.set({
        "created_at": new Date()
      });
    },

  });

  // Note Collection
  // ---------------

  // The collection of notes is backed by *Firebase*.
  var NoteList = Backbone.Firebase.Collection.extend({

    // Reference to this collection's model.
    model: Note,

    // Save all of the notes in a Firebase.
    firebase: new Firebase("https://sweltering-inferno-6969.firebaseio.com/"),

  });

  // Create our global collection of **Notes**.
  Notes = new NoteList();

  // Note Item View
  // --------------


  var SidebarNoteView = Backbone.View.extend({

    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#sidebar-note-template').html()),

    // The DOM events specific to an item.
    events: {
      "dblclick .preview"  : "edit",
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    // Re-render the note.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    // Move this note's content into the large form
    edit: function() {
      this.model.trigger("make_primary", this.model);
    },

  });

  var PrimaryNoteView = Backbone.View.extend({
    tagName:  "div",

    // Cache the template function for a single item.
    template: _.template($('#primary-note-template').html()),

    // The DOM events specific to an item.
    events: {
      "keypress #primary-note-title"  : "save",
      "keypress #primary-note-body"   : "save",
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    // Save changes to the note.
    save: function() {
      var title = this.$("#primary-note-title").val();
      var body = this.$("#primary-note-body").val();

      if (title && body) {
        this.model.set({
          title: title,
          body: body,
        });
      }

    },

  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#note-app"),


    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "click #new-note": "createNote",
    },

    // At initialization we bind to the relevant events on the `Notes`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting notes that might be saved in *Firebase*.
    initialize: function() {

      this.listenTo(Notes, 'add', this.addOne);
      this.listenTo(Notes, 'reset', this.addAll);

      this.listenTo(Notes, 'make_primary', this.makePrimary);

      this.titleInput = this.$('#current-note-title');
      this.bodyInput = this.$('#current-note-body');

    },

    // Add a single note item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(note) {
      var view = new SidebarNoteView({model: note});
      this.$("#note-list").append(view.render().el);
    },

    // Add all items in the **Notes** collection at once.
    addAll: function() {
      this.$("#note-list").html("");
      Notes.each(this.addOne, this);
    },

    // Create new **Note** model, persisting it to *Firebase*.
    createNote: function(e) {
      var note = new Note();
      Notes.add(note);
      this.makePrimary(note);
    },

    makePrimary: function(note){
      // TODO delete previous PrimaryNoteView
      this.primaryView = new PrimaryNoteView({model: note});
      this.$("#primary").html(this.primaryView.render().el);
    }

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView();

  // var n1 = new Note({title: "Fake Note #1", body: "Fake body"});
  // var n2 = new Note({title: "Fake Note #2", body: "Fake body"});
  // var n3 = new Note({title: "Fake Note #3", body: "Fake body"});
  // Notes.add([n1, n2, n3]);

//////////////////////////////////// });
