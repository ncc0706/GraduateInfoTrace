$(function () {
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // the header view
    var HeaderView = Backbone.View.extend({
        className: "header",
        events: {
            'click #ops-profile': 'showProfile',
            'click #ops-setting': 'showSetting',
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
        showProfile: function () {
            appRouter.navigate('profile', {trigger: true});
        },
        showSetting: function () {
            appRouter.navigate('setting', {trigger: true});
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

    // the info view
    var Info = Backbone.Model.extend({
        defaults: {
            // Personal profile
            id: "default",
            name: "default",
            email: "default",
            phone: "default",

            // School information
            time: "default",
            academy: "default",

            // Company information
            company: "default",
            province: "default"
        },
        url: '/json/infos'
    });

    var InfoView = Backbone.View.extend({
        className: "stut",
        events: {
            'click #save': 'saveInfo',
            'dblclick .info': 'editing',
            'blur input,select': 'blur'
        },
        initialize: function () {
            this.info = new Info();
            this.info.on('change', this.render, this);
            this.template = _.template($("#tpl-infos").html());
        },
        render: function () {
            this.$el.empty();
            // the info view
            this.$el.append(this.template(this.info.toJSON()));
            return this;
        },
        saveInfo: function () {
            this.info.save(null, {
                success: function () {
                    alert('信息更新成功！');
                }
            });
        },
        editing: function (e) {
            $(e.currentTarget)
                .removeClass('info')
                .addClass('editing')
                .find('input, select')
                .focus()
                .val('default');
        },
        blur: function (e) {

            var curele = $(e.currentTarget);

            var nowValue = $('<div />').text(curele.val()).html();
            var preValue = (this.info.toJSON())[curele.attr('name')];

            if(nowValue === '') {
                alert('删除指定信息！');
                nowValue = 'default';
            }

            if (nowValue === preValue) {
                alert('指定信息未更改！');
            } else {
                var obj = {};
                obj[curele.attr('name')] = nowValue;
                this.info.set(obj);
            }

            $(e.currentTarget)
                .parent()
                .parent()
                .removeClass('editing')
                .addClass('info');
        }

    });

    // the pic view
    var PicView = Backbone.View.extend({
        className: 'pic',
        events: {
            'click #setPic': 'setPic',
            'change #file': 'choosePic'
        },
        initialize: function () {
            this.template = _.template($('#tpl-pics').html());
        },
        render: function () {
            this.$el.append(this.template);
            return this;
        },
        setPic: function () {
            $.ajax({
                url: '/avatar/save',
                type: 'post',
                data: {},
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.code === 1) {
                        $('#avatar').attr("src", "/avatar/" + Math.random());
                        alert('头像设置成功！');
                    }
                },
                error: function (res) {
                    alert('头像设置失败！');
                }
            });
        },
        choosePic: function () {
            var formData = new FormData($('#uploadPic')[0]);
            $.ajax({
                url: '/avatar/pre',
                type: 'post',
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.code === 1) {
                        $('#avatar').attr("src", "/avatar/pre/" + Math.random());
                    }
                },
                error: function (res) {
                    alert('头像预览失败！');
                }
            });
        }
    });
    // the student view
    var StutView = Backbone.View.extend({
        className: 'student',
        initialize: function () {
            this.infoView = new InfoView();
            this.infoView.info.fetch({
                success: function (infos) {
                    console.log("成功获取学生个人信息！");
                }
            });
            this.picView = new PicView();
        },
        render: function () {
            this.$el.append(this.infoView.render().el);
            this.$el.append(this.picView.render().el);
            return this;
        }
    });

    // the setting view
    var SettingView = Backbone.View.extend({
        className: 'setting',
        events: {
            'click #code': 'changeCode',
            'click #updatepwd': 'updatepwd'
        },
        initialize: function () {
            this.template = _.template($('#tpl-setting').html());
        },
        render: function () {
            this.$el.append(this.template);
            return this;
        },
        changeCode: function () {
            $('#code').attr("src", "/code/" + Math.random());
        },
        updatepwd: function () {
            var formData = new FormData($('#changepwd')[0]);
            $.ajax({
                url: '/json/user',
                type: 'put',
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false,
                success: function (res) {
                    if (res.code === 1) {
                        alert('密码修改成功，请重新登录！');
                        appRouter.navigate('logout', {trigger: true});
                    } else {
                        if (res.code === 4)
                            alert('验证码错误！');
                        else if (res.code === 3)
                            alert('密码输入错误！');
                        else if (res.code === 2)
                            alert('未知错误！');
                        $('#code').attr("src", "/code/" + Math.random());
                        appRouter.navigate('setting', {trigger: true});
                    }
                },
                error: function (res) {
                    alert(res);
                }
            });
        }
    });

    // the main view
    var MainView = Backbone.View.extend({
        className: 'main',
        initialize: function () {
            this.stutView = new StutView();
            this.settingView = new SettingView();
        },
        render: function () {
            this.$el.append(this.stutView.render().el);
            this.$el.append(this.settingView.render().el);
            return this;
        },
        showProfile: function () {
            this.stutView.$el.removeClass('unshow');
            this.settingView.$el.addClass('unshow');
        },
        showSetting: function () {
            this.stutView.$el.addClass('unshow');
            this.settingView.$el.removeClass('unshow');
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
        showProfile: function () {
            this.mainView.showProfile();
        },
        showSetting: function () {
            this.mainView.showSetting();
        }
    });

    // the router
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'showProfile',
            'profile': 'showProfile',
            'setting': 'showSetting',
            'logout': 'logOut'
        },
        showProfile: function () {
            appView.showProfile();
        },
        showSetting: function () {
            appView.showSetting();
        },
        logOut: function () {
            window.location.href = '/logout';
        }

    });

    var appView = new AppView();
    var appRouter = new AppRouter();

    Backbone.history.start();
});
