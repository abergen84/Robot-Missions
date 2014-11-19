;(function(window, undefined){

var RobotView = Backbone.View.extend({
    tagName: "div",
    className: "robot grid grid-2",
    template: $("#robot-template").html(),
    initialize: function(options){
        this.options = _.extend({}, options, { $container: $(".robots") })

        this.options.$container.append( this.el )
        this.render();
    },
    render: function(){
        this.el.innerHTML = _.template(this.template, this.model.attributes);
    }
})

var Robot = Backbone.Model.extend({
    urlRoot:"http://space-robots.herokuapp.com/robots",
    defaults: {
        name: "Bender",
        photo: "https://31.media.tumblr.com/tumblr_m4aogmpvKP1qdnki4o1_400.gif"
    },
    initialize: function(){
        this.view = new RobotView({ model: this })
    }
})

var RobotCollective = Backbone.Collection.extend({
    model: Robot,
    url:"http://space-robots.herokuapp.com/robots",
    initialize: function(){
        this.fetch().then(function(){})
    },
    parse: function(data){
        return data.robots;
    }
});

window.robots = new RobotCollective();

})(window, undefined)