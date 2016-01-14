$(function () {
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // the header view
    var HeaderView = Backbone.View.extend({
        className: "header",
        events: {
            'click #ops-self': 'showAdmin',
            'click #ops-users': 'showUsers',
            'click #ops-logout': 'logOut',
            'mouseover #more': 'showMore',
            'mouseout #more': 'hideMore'
        },
        initialize: function () {
            this.template = _.template($("#tpl-more").html());
        },
        render: function () {
            this.$el.append(this.template);
            return this;
        },
        showAdmin: function () {
            appRouter.navigate('self', {trigger: true});
        },
        showUsers: function () {
            appRouter.navigate('', {trigger: true});
        },
        logOut: function () {
            appRouter.navigate('logout', {trigger: true});
        },
        showMore: function () {
            $('.ops').removeClass("unshow");
        },
        hideMore: function () {
            $('.ops').addClass("unshow");
        }
    });

    // the user view
    var User = Backbone.Model.extend({
        defaults: {
            name: "default",
            role: "student"
        },
        url: '/json/user'
    });

    var Users = Backbone.Collection.extend({
        model: User,
        url: '/json/users'
    });

    var users = new Users();

    var UserView = Backbone.View.extend({
        tagName: 'li',
        className: 'info',
        template: _.template($("#tpl-user").html()),
        events: {
            "click span button": "resetPWD"
        },
        initialize: function () {
            this.model.on("change", this.render, this);
        },
        render: function () {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        resetPWD: function () {
            //reset the password
            this.model.set({passwd: ''});
            this.model.save();
        }
    });

    var UsersView = Backbone.View.extend({
        el: $("#users-show"),
        initialize: function () {
            this.model.on('reset', this.render, this);
            this.model.on('add', this.renderOne, this);
        },
        render: function () {
            for (var i = 0; i < this.model.models.length; i++) {
                var userView = new UserView({model: this.model.models[i]});
                this.$el.append(userView.render().el);
            }
            return this;
        },
        renderOne: function (user) {
            var userView = new UserView({model: user});
            this.$el.append(userView.render().el);
        }
    });

    // the add view
    var AddView = Backbone.View.extend({
        el: $("#user-add"),
        events: {
            "click #addUser": "addUser"
        },
        initialize: function () {
            this.template = _.template($("#tpl-add").html());
            this.model.on('reset', this.render, this);
            this.model.on('add', this.render, this);
        },
        render: function () {
            this.$el.empty();
            this.$el.append(this.template());
            return this;
        },
        addUser: function () {
            var user = new User({
                name: $('<div />').text($("#name-add").val()).html(),
                role: $("#role-add").val()
            });
            user.save(null,
                {
                    success: function (res) {
                        users.add(user);
                        alert('成功创建用户' + res.id + '!');
                    }, wait: true
                });
        }
    });

    // the user manage view
    var UserManageView = Backbone.View.extend({
        className: 'user-manage',
        initialize: function () {
            this.usersView = new UsersView({model: users});
            this.addView = new AddView({model: users});
            users.fetch({
                reset: true,
                success: function () {
                    console.log("Get the users successfully !");
                }
            });
        },
        render: function () {
            this.$el.append(this.usersView.render().el);
            this.$el.append(this.addView.render().el);
            return this;
        }
    });

    // the admin view
    var Admin = Backbone.Model.extend({
        defaults: {
            id: "default",
            name: "default"
        },
        url: '/json/infos'
    });

    // the admin view
    var AdminView = Backbone.View.extend({
        className: 'admin',
        initialize: function () {
            // need to complete
            this.admin = new Admin();
            this.admin.on('change', this.render, this);
            this.template = _.template($("#tpl-admin").html());
        },
        render: function () {
            //need to complete
            this.$el.empty();
            this.$el.append(this.template(this.admin.toJSON()));
            return this;
        }
    });

    // the main view
    var MainView = Backbone.View.extend({
        className: 'main',
        initialize: function () {
            // need to complete
            this.userManageView = new UserManageView();
            this.adminView = new AdminView();
            this.adminView.admin.fetch({
                success: function (adminInfo) {
                    console.log("成功获取管理员个人信息！");
                }
            });
        },
        render: function () {
            // need to complete
            this.$el.append(this.userManageView.render().el);
            this.$el.append(this.adminView.render().el);
            return this;
        },
        showUser: function () {
            this.userManageView.$el.removeClass('unshow');
            this.adminView.$el.addClass('unshow');
        },
        showAdmin: function () {
            this.userManageView.$el.addClass('unshow');
            this.adminView.$el.removeClass('unshow');
        }
    });

    // the app view
    var AppView = Backbone.View.extend({
        el: $('#app'),
        initialize: function () {
            this.headerView = new HeaderView();
            this.mainView = new MainView();
            this.render();
        },
        render: function () {
            this.$el.append(this.headerView.render().el);
            this.$el.append(this.mainView.render().el);
        },
        showUser: function () {
            this.mainView.showUser();
        },
        showAdmin: function () {
            this.mainView.showAdmin();
        }
    });

    // the router
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'showUser',
            'self': 'showAdmin',
            'logout': 'logOut'
        },
        showUser: function () {
            appView.showUser();
        },
        showAdmin: function () {
            appView.showAdmin();
        },
        logOut: function () {
            window.location.href = '/logout';
        }
    });

    var appView = new AppView();
    var appRouter = new AppRouter();

    Backbone.history.start();

});
