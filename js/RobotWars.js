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
        photo: "https://31.media.tumblr.com/tumblr_m4aogmpvKP1qdnki4o1_400.gif",
        shouldRenderToScreen: true
    },
    initialize: function(){
        if(this.get('shouldRenderToScreen')){
            this.view = new RobotView({ model: this })
        }
    },
    parse: function(data){
        return data.robot;
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

var MissionView = Backbone.View.extend({
    tagName: "div",
    className: "grid grid-5 mission",
    template: $("#mission-template").html(),
    initialize: function(options){
        this.options = _.extend({}, options, { $container: $(".mission-container") })

        this.options.$container.append( this.el )
        // this.render();
    },
    render: function(){
        this.el.innerHTML = _.template(this.template, this.model.attributes);
    }
})

var Mission = Backbone.Model.extend({
    urlRoot: "http://space-robots.herokuapp.com/missions",
    defaults: {
        song: "Ice Ice Baby",
        dance: "Foxtrot",
        location: "pluto",
        completed: false
    },
    // validate: function(attrs){
    //     if(typeof attrs.robot_id === "undefined" || (typeof attrs.robot_id !== "number" && !attrs.robot_id)){
    //         alert("Y U NO ROBOT ID");
    //         return "No robot id provided.";
    //     }
    // },
    initialize: function(){
        this.view = new MissionView({ model: this })

        var location = new Giphy({ query: this.get('location') });
        var song = new Giphy({ query: this.get('song') });
        var dance = new Giphy({ query: this.get('dance') });
        var robot = new Robot({ id: this.get('robot_id'), shouldRenderToScreen: false });

        var self = this;
        $.when(
            location.fetch(),
            song.fetch(),
            dance.fetch(),
            robot.fetch()
        ).then(function(){
            self.set('robot_photo', robot.get('photo'));
            self.set('giphy_location_url', location.get('url'));
            self.set('giphy_song_url', song.get('url'));
            self.set('giphy_dance_url', dance.get('url'));

            self.view.render();
        })
    }
})

var MissionCollection = Backbone.Collection.extend({
    model: Mission,
    url: "http://space-robots.herokuapp.com/missions",
    initialize: function(){
        this.startRequest()
    },
    parse: function(data){
        return data.missions
    },
    startRequest: function(){
        document.querySelector('.mission-container').innerHTML = "";
        this.fetch();
    }
})


var Giphy = Backbone.Model.extend({
    defaults: {
        url: "http://media0.giphy.com/media/DFiwMapItOTh6/giphy.gif"
    },
    urlRoot: function(){
        return [
            "http://api.giphy.com/v1/gifs/search?q=",
            this.get('query'),
            "&api_key=dc6zaTOxFJmzC"
        ].join("");
    },
    parse: function(data){
        if(!data || !data.data || !data.data.length){
            return {};
        }
        var images = data.data; //<-- an array of giphy submissions
        var chosenImage = images[ Math.round((images.length - 1) * Math.random()) ]
        var original_image = chosenImage.images.original;
        return original_image;
    }
})

function TURNARRAYRIGHTNOW(arr){
    /// TURN ARRAY
    ///
    /// RIIIIIIIGHT NAOW
    var obj = {};
    for(var i in arr){
        obj[arr[i].name] = arr[i].value
    };
    return obj;
}

var MissionCreator = Backbone.View.extend({
    el: document.querySelector('.mission-creator'),
    events: {
        "submit form": "addMission"
    },
    addMission: function(event){
        event.preventDefault();

        var arr = this.$el.find('input').serializeArray();
        var obj = TURNARRAYRIGHTNOW(arr)

        var newMission = new Mission(obj);
        var status = newMission.save();

        status.then(function(){
            window.missions.startRequest();
        })

        status.fail(function(data){
            alert("ERROR:"+JSON.stringify(data));
        })
    }
})

var AppView = Backbone.View.extend({
    el: document.body,
    initialize: function(){
        this.views = {
            robots: $('.robots-container'),
            missions: $('.missions, .mission-creator')
        }
    },
    events: {
        "click .mission-control a": "handleClick",
    },
    handleClick: function(event){
        var clicked = event.target;
        var show = clicked.getAttribute('show');
        var self = this;
        _.forEach(this.views, function(value, key){
            value.fadeOut();
        })
        this.views[show].fadeIn();
    }
})

window.robots = new RobotCollective();
window.missions = new MissionCollection();
window.missionCreator = new MissionCreator();
window.appView = new AppView();

})(window, undefined)