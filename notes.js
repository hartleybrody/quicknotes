var Notes;

/////////////////////////////////////////////////// $(function(){

  // Our basic **Note** model has `title`, `body` and `created_at` attributes.
  var Note = Backbone.Model.extend({

    defaults: {
      title: "New Note...",
      body: "",
      is_primary: null
    },

    initialize: function() {
      if (!this.get("created_at")){
        this.set({ "created_at": new Date()});
      }

      if (this.get("is_primary")){
        App.make_primary(this);
      }
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

    tagName:  "tr",

    template: _.template($('#sidebar-note-template').html()),

    events: {
      "click .note-edit":     "edit",
      "click .note-preview":  "edit",
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      var templateData = this.model.toJSON();

      var maxTitleLength = 20;
      if (templateData["title"].length > maxTitleLength){
        templateData["title"] = templateData["title"].substring(0, maxTitleLength) + "...";
      }

      var maxBodyLength = 160;
      if (templateData["body"].length > maxBodyLength){
        templateData["body"] = templateData["body"].substring(0, maxBodyLength) + "...";
      }
      
      this.$el.html(this.template(templateData));
      return this;
    },

    // Move this note's content into the primary view
    edit: function() {
      App.make_primary(this.model);
    },

  });

  var PrimaryNoteView = Backbone.View.extend({
    tagName:  "div",

    // Cache the template function for a single item.
    template: _.template($('#primary-note-template').html()),

    // The DOM events specific to an item.
    events: {
      "keyup #primary-note-title"  : "save",
      "keyup #primary-note-body"   : "save",
      "click #note-primary-delete" : "destroy",
    },

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      // console.log("rendering PrimaryNoteView");
      // console.log(this.model.toJSON());
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    save: function() {
      var title = this.$("#primary-note-title").val();
      var body = this.$("#primary-note-body").val();

      if (title) {
        this.model.set({
          title: title,
          body: body,
        });
      }

    },

    destroy: function(){
      window.confirm("Are you sure you want to delete this note?") && Notes.remove(this.model);
    }

  });


  var AppView = Backbone.View.extend({

    el: $("#note-app"),

    events: {
      "click #note-new": "create_note",
    },

    initialize: function() {

      this.listenTo(Notes, 'add', this.add_note_to_sidebar);
      this.listenTo(Notes, 'reset', this.reset_sidebar);
      this.listenTo(Notes, 'remove', this.reset_sidebar);
      this.listenTo(Notes, 'sync', this.reset_sidebar);

      this.listenTo(Notes, 'make_primary', this.make_primary);

    },

    add_note_to_sidebar: function(note) {
      var view = new SidebarNoteView({model: note});
      this.$("#note-list").append(view.render().el);
    },

    reset_sidebar: function() {
      this.$("#note-list").html("");
      if (Notes.models.length === 0){
        this.create_note({}, {
          "title": "Welcome to Quicknotes",
          "body": "Any changes you make here are immediately available and synced to all of your devices.\n\nCreate an account to save your notes.",
          "created_at": new Date()
        });
      }
      else {
        Notes.each(this.add_note_to_sidebar, this);
        this.make_primary(Notes.models[0]);
      }
    },

    create_note: function(e, note_attrs) {
      var note = new Note();
      if (note_attrs && typeof note_attrs === "object"){
        note.set(note_attrs);
      }
      this.make_primary(note);
      Notes.add(note);
    },

    make_primary: function(note){
      Notes.each(function(n){
        n.set("is_primary", false);
      });
      note.set("is_primary", true);

      delete this.primaryView;  // remove reference to existing primaryView
      this.primaryView = new PrimaryNoteView({model: note});
      this.$("#primary").html(this.primaryView.render().el);
    }

  });

  var App = new AppView();

  // var n1 = new Note({title: "Fake Note #1", body: "Fake body #1"});
  // var n2 = new Note({title: "Fake Note #2", body: "Fake body #2"});
  // var n3 = new Note({title: "Fake Note #3", body: "Fake body #3"});
  // Notes.add([n1, n2, n3]);

/////////////////////////////////////////////////// });
