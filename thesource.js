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
      var that = this;
      if (Session.equals("selected_source", this._id)) {
        return null;
      }
      Session.set("selected_source", this._id);
      $(".source-form").hide();
      Meteor.flush();

      AnimationUtil.init();

      var comments = Comments.find({source_id: that._id});
      comments.observe({
        added: function(comment) {
          var commentbox = Meteor.ui.render(function(){
            return Template.commentbox(comment);
          });
          document.getElementById("contents").appendChild(commentbox);
          startAnimation(comment);
          $.play();
        }
      });
      comments.fetch();
      Session.set("source_comments", comments);
      Meteor.flush();
    },
    'click .btn-danger': function() {
      Session.set("selected_source", null);
      Sources.remove(this._id);
    }
  };

  Template.source.selected_source = function() {
    return Session.get("selected_source") === this._id ? "selected" : "";
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
          var body = line.replace(/\s/g, "&nbsp;");
          return {num: num, body: prettyPrintOne(body)};
        } else {
          return {num: num, body: "<br />"};
        }
      });
  };
  Template.sourceview.comments = function() {
    return Session.get("source_comments");
  };

  function startAnimation(comment) {
    var source_line = $(".source-line");
    var comment_box = $("#comment-" + comment._id);
    var x1 = Math.floor( (source_line.width() - comment_box.width()) / 2 );
    var y1 = Math.floor( source_line.height() * comment.line - (source_line.height() / 2) );
    var x2 = Math.floor( x1 - 200 + Math.floor(Math.random() * 400));
    var y2 = Math.floor( y1 - (4 * source_line.height()) + Math.random() * (8 * source_line.height()) );

    var context = document.getElementById("bitmap").getContext("2d");
    context.strokeStyle = "red";
    context.beginPath();
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(x1, y1);
    context.arc(x1, y1, 5, 0, Math.PI*2, false);
    context.stroke();
    context.closePath();

    comment_box.tween({
      top: {
        start: y1,
        stop: y2,
        time: 0.001,
        duration: 0.5,
        effect: "cubicOut",
      },
      left: {
        start: x1,
        stop: x2,
        time: 0.001,
        duration: 0.5,
        effect: "cubicOut",
      }
    });
  }

  Template.commentbox.style = function() {
    var source_line = $(".source-line");
    var comment_box = $("#comment-" + this._id);
    var x1 = Math.floor( (source_line.width() - comment_box.width()) / 2 );
    var y1 = Math.floor( source_line.height() * this.line - (source_line.height() / 2) );
    return "top: " + y1.toString() + "px; left: " + x1.toString() + "px;";
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
      $(".comment-form").remove();
      var linenum = parseInt(event.target.parentNode.getAttribute("data-line"));
      var comment = {source_id: Session.get("selected_source"), line: linenum};
      Session.set("ready_comment", comment);
      var fragment = Meteor.ui.render(function(){
        return Template.commentbody();
      });
      $(fragment).insertAfter($("#line-" + linenum.toString()));
    }
  };

  Template.commentbody.events = {
    'click input.comment-submit': function(event) {
      var comment_body = $("#comment-body-input").val();
      var comment = _.extend({body: comment_body}, Session.get("ready_comment"));
      var comment_id = Comments.insert(comment);
      _.extend(comment, {_id: comment_id});
      $(".comment-form").remove();
      Session.set("ready_comment", null);
    },
    'click input.comment-cancel': function(event) {
      $(".comment-form").remove();
      Session.set("ready_comment", null);
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
