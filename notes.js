var Notes;

$(function(){

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

  var NoteList = Backbone.Firebase.Collection.extend({

    // Reference to this collection's model.
    model: Note,

    // Save all of the notes in a Firebase.
    firebase: new Firebase("https://sweltering-inferno-6969.firebaseio.com/"),
  });

  Notes = new NoteList();


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
      console.log(this.model.toJSON());
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


  var AppView = Backbone.View.extend({

    el: $("#note-app"),

    events: {
      "click #new-note": "createNote",
    },

    initialize: function() {

      this.listenTo(Notes, 'add', this.addOne);
      this.listenTo(Notes, 'reset', this.addAll);

      this.listenTo(Notes, 'make_primary', this.makePrimary);

      this.titleInput = this.$('#current-note-title');
      this.bodyInput = this.$('#current-note-body');

    },

    addOne: function(note) {
      var view = new SidebarNoteView({model: note});
      this.$("#note-list").append(view.render().el);
    },

    addAll: function() {
      this.$("#note-list").html("");
      Notes.each(this.addOne, this);
    },

    createNote: function(e) {
      var note = new Note();
      Notes.add(note);
      // note.trigger("make_primary", note);
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

  // var n1 = new Note({title: "Fake Note #1", body: "Fake body #1"});
  // var n2 = new Note({title: "Fake Note #2", body: "Fake body #2"});
  // var n3 = new Note({title: "Fake Note #3", body: "Fake body #3"});
  // Notes.add([n1, n2, n3]);

});
