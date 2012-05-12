Sources = new Meteor.Collection("sources");
Comments = new Meteor.Collection("comments");

Session.set("selected_source", null);
Session.set("ready_comment", null);

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
        num = num + 1;
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
  
    Template.sourcebody.events = {
  	  'click .icon-pencil': function(event) {
		var linenum = parseInt(event.target.parentNode.getAttribute("data-line"));
		var comment = {source_id: Session.get("selected_source"), line: linenum};
		  Session.set("ready_comment", comment);
		  var html_body = jQuery(Template.commentbody());
		  html_body.insertAfter($("#line-" + linenum.toString()));
		}
	};

    Template.commentbody.events = {
  	  'click input.btn-primary': function(event) {
		    alert("test");
			var commnet_body = $("#comment-body-input").val();
			console.log(comment_body);
			
			var comment = _.extend(comment_body, Session.get("ready_comment"));
			Comments.insert(comment);
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
