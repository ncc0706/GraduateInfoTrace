$(function () {
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    var LoginView = Backbone.View.extend({
        el: $("#login"),
        template: _.template($('#tpl-login').html()),
        events: {
            'click #code': 'changeCode',
            'click .sub': 'respon'
        },
        initialize: function () {
        },
        render: function () {
            this.$el.append(this.template());
        },
        changeCode: function () {
            $('#code').attr("src", "/code/" + Math.random());
        },
        respon: function() {
            console.log('-----------------------');
        }
    });

    var loginView = new LoginView();
    loginView.render();

    $('.keyboard').keyboard({lang: 'en'});
});
