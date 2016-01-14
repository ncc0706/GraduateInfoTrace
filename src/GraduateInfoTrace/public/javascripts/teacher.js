$(function () {
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // the header view
    var HeaderView = Backbone.View.extend({
        className: "header",
        events: {
            'click #ops-self': 'showTeacher',
            'click #ops-stuts': 'showStuts',
            'click #ops-logout': 'logOut',
            'click #ops-visual': 'showVisual',
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
        showTeacher: function () {
            appRouter.navigate('self', {trigger: true});
        },
        showStuts: function () {
            appRouter.navigate('stuts', {trigger: true});
        },
        showVisual: function () {
            appRouter.navigate('visual', {trigger: true});
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

    // the student view
    var Stut = Backbone.Model.extend({
        defaults: {
            id: "default",
            name: "default",
            time: "default",
            company: "default",
            province: "default"
        }
    });

    var Stuts = Backbone.Collection.extend({
        initialize: function (model, options) {
            this.on('reset', function () {
                options.view.renderTable(JSON.parse(JSON.stringify(this.models)));
            });
            this.on('sort', function () {
                options.view.renderTable(JSON.parse(JSON.stringify(this.models)));
            });
        },
        model: Stut,
        url: '/json/stuts'
    });

    var StutsView = Backbone.View.extend({
        className: 'students',
        events: {
            'click #uid': 'sortById',
            'click #time': 'sortByTime',
            'click #company': 'sortByCompany',
            'click #name': 'sortByName',
            'click #province': 'sortByProvince',
            'keyup #words': 'search'
        },
        initialize: function () {
            this.stuts = new Stuts(null, {view: this});
            this.template = _.template($("#tpl-stuts").html());
        },
        render: function () {
            this.$el.append(_.template($("#tpl-stuts-search").html()))
            this.$el.append('<div id=\"data\" />');
            return this;
        },
        renderTable: function (items) {
            $('#data').empty();
            $('#data').append(_.template($("#tpl-stuts-title").html()));
            for (var i = 0; i < items.length; i++) {
                $('#data').append(this.template(items[i]));
            }
        },
        sortById: function () {
            this.stuts.comparator = 'id';
            this.stuts.sort();
        },
        sortByTime: function () {
            this.stuts.comparator = 'time';
            this.stuts.sort();
        },
        sortByName: function () {
            this.stuts.comparator = 'name';
            this.stuts.sort();
        },
        sortByCompany: function () {
            this.stuts.comparator = 'company';
            this.stuts.sort();
        },
        sortByProvince: function () {
            this.stuts.comparator = 'province';
            this.stuts.sort();
        },
        search: function () {
            var inWords = $('#words').val().split(' ');

            var srcs = this.stuts.toJSON();
            var ress = [];

            for (var word in inWords) {

                if (inWords[word] === '')
                    continue;

                for (var key in srcs) {
                    if (JSON.stringify(srcs[key]).indexOf(inWords[word]) >= 0)
                        ress.push(srcs[key]);
                }

                srcs = ress;
                ress = [];
            }

            this.renderTable(srcs);
        }
    });

    // the teacher info view
    var Info = Backbone.Model.extend({
        defaults: {
            id: 'default',
            name: 'default',
            email: 'default',
            phone: 'default',
            academy: 'default'
        },
        url: '/json/infos'
    });

    var InfoView = Backbone.View.extend({
        className: 'teacherinfo',
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
            this.$el.append(this.template(this.info.toJSON()));
            return this;
        },
        saveInfo: function () {
            this.info.save(null, {
                success: function (model, response) {
                    console.log('Save the information successfully !');
                }
            })
        },
        editing: function (e) {
            $(e.currentTarget).removeClass('info').addClass('editing')
                .find('input, select').focus();
        },
        blur: function (e) {
            var curele = $(e.currentTarget);
            var obj = {};
            obj[curele.attr('name')] = curele.val();
            this.info.set(obj);
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
                    //console.log(res);
                    alert('头像设置失败!');
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
                        alert('头像预览成功！');
                    }
                },
                error: function (returnData) {
                    alert('头像预览失败！');
                    //alert(returnData);
                }
            });
        }
    });

    // the teacher view
    var TeacherView = Backbone.View.extend({
        className: 'teacher',
        initialize: function () {
            this.infoView = new InfoView();
            this.infoView.info.fetch({
                success: function (infos) {
                    console.log("Get the infos successfully !");
                },
                error: function (err) {
                    console.log(err);
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

    // the visual view
    var VisualView = Backbone.View.extend({
        className: 'visual unshow',
        initialize: function () {
            visual();
            this.template = _.template($('#tpl-visual').html());
        },
        render: function () {
            this.$el.append(this.template);
            return this;
        }
    });

    // the main view
    var MainView = Backbone.View.extend({
        className: 'main',
        initialize: function () {
            this.stutsView = new StutsView();
            this.stutsView.stuts.fetch({
                reset: true,
                success: function (stuts) {
                    console.log("Get the users successfully !");
                    stuts.comparator = 'id';
                    stuts.sort();
                }
            });
            this.teacherView = new TeacherView();
            this.visualView = new VisualView();
        },
        render: function () {
            this.$el.append(this.stutsView.render().el);
            this.$el.append(this.teacherView.render().el);
            this.$el.append(this.visualView.render().el);
            return this;
        },
        showStuts: function () {
            this.stutsView.$el.removeClass('unshow');
            this.teacherView.$el.addClass('unshow');
            this.visualView.$el.addClass('unshow');
        },
        showTeacher: function () {
            this.stutsView.$el.addClass('unshow');
            this.teacherView.$el.removeClass('unshow');
            this.visualView.$el.addClass('unshow');
        },
        showVisual: function () {
            this.stutsView.$el.addClass('unshow');
            this.teacherView.$el.addClass('unshow');
            this.visualView.$el.removeClass('unshow');
        }
    });

    // the app view
    var AppView = Backbone.View.extend({
        el: $("#app"),
        initialize: function () {
            this.headerView = new HeaderView();
            this.mainView = new MainView();
            this.render();
        },
        render: function () {
            this.$el.append(this.headerView.render().el);
            this.$el.append(this.mainView.render().el);
        },
        showStuts: function () {
            this.mainView.showStuts();
        },
        showTeacher: function () {
            this.mainView.showTeacher();
        },
        showVisual: function () {
            this.mainView.showVisual();
        }
    });

    // the router
    var AppRouter = Backbone.Router.extend({
        routes: {
            '': 'showVisual',
            'stuts': 'showStuts',
            'self': 'showTeacher',
            'visual': 'showVisual',
            'logout': 'logOut'
        },
        showStuts: function () {
            appView.showStuts();
        },
        showTeacher: function () {
            appView.showTeacher();
        },
        showVisual: function () {
            appView.showVisual();
        },
        logOut: function () {
            window.location.href = '/logout';
        }
    });

    var appView = new AppView();
    var appRouter = new AppRouter();

    Backbone.history.start();

});
