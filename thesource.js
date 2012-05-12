Sources = new Meteor.Collection("sources");

Session.set("selected_source", null);

if (Meteor.is_client) {
  Template.sideboard.sources = function() {
    return Sources.find({});
  };

  Template.sideboard.events = {
    'click .back': function() {
      Session.set("selected_source", null);
      $(".source-form").show();
    }
  };

  Template.source.events = {
    'click .source-list-name': function() {
      Session.set("selected_source", this._id);
      $(".source-form").hide();
    },
    'click .btn-danger': function() {
      Session.set("selected_source", null);
      Sources.remove(this._id);
    }
  };

  Template.mainboard.selected_source = function() {
    return Session.get("selected_source");
  };

  Template.sourceview.source_name = function() {
    if (Session.get("selected_source"))
      var source = Sources.findOne(Session.get("selected_source"));
      return source && source.name;
  };
  Template.sourceview.source_body = function() {
    if (Session.get("selected_source"))
      var source = Sources.findOne(Session.get("selected_source"));
      return source && _.map(source.body.split("\n"), function(line, num) {
        if (line != "") {
          line = line.replace(/&/g,'&amp;');
          line = line.replace(/>/g,'&gt;');
          line = line.replace(/</g,'&lt;');
          var body = line.replace(/\s/g, "&nbsp;&nbsp;");
          return {num: num, body: prettyPrintOne(body)};
        } else {
          return {num: num, body: "<br />"};
        }
      });
  };

  Template.mainboard.events = {
    'click .form-submit': function() {
      var name = $("#form-title-input").val();
      var body = $("#form-body-input").val();
      Sources.insert({name: name, body: body});
      $("#form-title-input").val("");
      $("#form-body-input").val("");
    }
  };
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (Sources.find().count() === 0) {
      var name = "hello.js";
      var body = "alert('hello');";
      Sources.insert({name: name, body: body});
    }
  });
}
