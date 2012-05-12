Sources = new Meteor.Collection("sources");

if (Meteor.is_client) {
  Template.sideboard.sources = function() {
    return Sources.find({});
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
