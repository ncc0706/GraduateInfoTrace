function visual() {
    var users = new Backbone.Collection;
    users.url = '/json/stuts';
    users.comparator = 'time';
    users.fetch({
        reset: true,
        success: function () {
            console.log('Get the users successfully !');

            var items = [];

            for (var i = 0; i < users.models.length; i++) {
                items.push(users.models[i].attributes)
            }

            Dashboard(items);

            ChinaGeo(items);

        }
    });
}

function Dashboard(items) {

    var res = [];

    var byTimes = _.groupBy(items, function (item) {
        return item['time'];
    });

    for (var key in byTimes) {
        var byCompanys = _.groupBy(byTimes[key], function (item) {
            return item['company'];
        });

        var data = {'key': key, 'all': _.size(byTimes[key]), 'more': {}};


        if (byCompanys['HW'])
            data.more['HW'] = _.size(byCompanys['HW']);
        else
            data.more['HW'] = 0;


        if (byCompanys['BD'])
            data.more['BD'] = _.size(byCompanys['BD']);
        else
            data.more['BD'] = 0;

        data.more['OT'] = data.all - data.more['BD'] - data.more['HW'];

        res.push(data);
    }

    var barColor = 'steelblue';
    var colors = {HW: "#807dba", OT: "#e08214", BD: "#41ab5d"};

    function histoGram(data) {

        var hg = {};

        var dim = {t: 60, r: 25, b: 30, l: 25};
        dim.w = 400 - dim.l - dim.r;
        dim.h = 300 - dim.t - dim.b;

        var svg = d3.select('#time-company-tg')
            .append('svg')
            .attr('width', dim.w + dim.l + dim.r)
            .attr('height', dim.h + dim.t + dim.b);

        var x = d3.scale.ordinal()
            .rangeBands([0, dim.w], 0.1)
            .domain(data.map(function (d) {
                return d[0];
            }));


        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' + dim.l + ',' + (dim.t + dim.h) + ')')
            .call(d3.svg.axis().scale(x).orient('bottom'));

        var y = d3.scale.linear()
            .range([dim.h, 0])
            .domain([0, d3.max(data, function (d) {
                return d[1];
            })]);


        var bars = svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'bar');

        bars.append('rect')
            .attr('x', function (d) {
                return x(d[0]);
            })
            .attr('y', function (d) {
                return y(d[1]);
            })
            .attr('transform', 'translate(' + dim.l + ',' + dim.t + ')')
            .attr('width', x.rangeBand())
            .attr('height', function (d) {
                return dim.h - y(d[1]);
            })
            .attr('fill', barColor)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout);


        bars.append("text")
            .text(function (d) {
                return d3.format(",")(d[1]);
            })
            .attr("x", function (d) {
                return x(d[0]) + x.rangeBand() / 2;
            })
            .attr("y", function (d) {
                return y(d[1]) - 5;
            })
            .attr('transform', 'translate(' + dim.l + ',' + dim.t + ')')
            .attr("text-anchor", "middle");

        hg.update = function (d, color) {
            y.domain([0, d3.max(d, function (t) {
                return t[1];
            })]);

            var bars = svg.selectAll('.bar').data(d);

            bars.select('rect')
                .transition()
                .duration(500)
                .attr('y', function (t) {
                    return y(t[1]);
                })
                .attr('height', function (t) {
                    return dim.h - y(t[1]);
                })
                .attr('fill', color);

            bars.select('text')
                .transition()
                .duration(500)
                .text(function (t) {
                    return d3.format(',')(t[1])
                })
                .attr('y', function (t) {
                    return y(t[1]) - 5
                });
        }

        function mouseover(current) {
            var fd = res.filter(function (d) {
                return d.key == current[0];
            })[0];

            var od = d3.keys(fd.more)
                .map(function (k) {
                    return {type: k, count: fd.more[k]};
                });

            pc.update(od);
            leg.update(od);
        }

        function mouseout(d) {
            pc.update(pData);
            leg.update(pData);
        }

        return hg;
    }

    function pieChart(data) {

        var pc = {};

        var dim = {w: 250, h: 250};
        dim.r = Math.min(dim.w, dim.h) / 2;

        var svg = d3.select('#time-company-pc')
            .append('svg')
            .attr('width', dim.w)
            .attr('height', dim.h)
            .attr("transform", "translate(" + dim.w / 2 + "," + dim.h / 2 + ")");

        var arc = d3.svg.arc()
            .outerRadius(dim.r - 10)
            .innerRadius(0);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.count;
            })

        svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('d', arc)
            .each(function (d) {
                this._current = d
            })
            .style('fill', function (d) {
                return colors[d.data.type];
            })
            .on('mouseover', mouseover)
            .on('mouseout', mouseout);

        pc.update = function (d) {
            svg.selectAll('path')
                .data(pie(d))
                .transition()
                .duration(500)
                .attrTween('d', arcTween);
        }

        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function (t) {
                return arc(i(t));
            };
        }

        function mouseover(d) {
            hg.update(res.map(function (v) {
                return [v.key, v.more[d.data.type]];
            }), colors[d.data.type]);
        }

        function mouseout(d) {
            hg.update(res.map(function (v) {
                return [v.key, v.all];
            }), barColor);
        }

        return pc;

    }

    function legend(ld) {

        var leg = {};

        var legend = d3.select('#time-company-lg')
            .append('table')
            .attr('class', 'legend');

        var tr = legend.append('tbody')
            .selectAll('tr')
            .data(ld)
            .enter()
            .append('tr');

        tr.append("td")
            .append("svg")
            .attr("width", '20')
            .attr("height", '20')
            .append("rect")
            .attr("width", '20')
            .attr("height", '20')
            .attr("fill", function (d) {
                return colors[d.type];
            });

        tr.append("td")
            .text(function (d) {
                return d.type;
            });

        tr.append("td")
            .attr("class", 'legendAll')
            .text(function (d) {
                return d3.format(",")(d.count);
            });

        tr.append("td")
            .attr("class", 'legendPerc')
            .text(function (d) {
                return getLegend(d, ld);
            });

        leg.update = function (nD) {
            var l = legend.select("tbody").selectAll("tr").data(nD);

            l.select(".legendAll").text(function (d) {
                return d3.format(",")(d.count);
            });

            l.select(".legendPerc").text(function (d) {
                return getLegend(d, nD);
            });
        }

        function getLegend(d, aD) {
            return d3.format("%")(d.count / d3.sum(aD.map(function (v) {
                    return v.count;
                })));
        }

        return leg;
    }

    var hData = res.map(function (d) {
        return [d.key, d.all];
    });
    hg = histoGram(hData);

    var pData = ['HW', 'BD', 'OT'].map(function (d) {
        return {
            type: d, count: d3.sum(res.map(function (t) {
                return t.more[d];
            }))
        }
    });
    pc = pieChart(pData);

    leg = legend(pData);

}

function ChinaGeo(items) {

    // the data

    var res = {};

    var byProvinces = _.groupBy(items, function (item) {
        return item['province'];
    });

    var maxValue = -1;
    var minValue = 0;

    for (var key in byProvinces) {

        res[key] = _.size(byProvinces[key]);

        if (parseInt(res[key]) > parseInt(maxValue))
            maxValue = res[key];

    }

    // the color

    var colorLinear = d3.scale.linear()
        .domain([minValue, maxValue])
        .range([0, 1]);

    var a = d3.rgb(255, 255, 255);
    var b = d3.rgb(0, 0, 255);

    var color = d3.interpolate(a, b);

    var width = 850;
    var height = 850;

    var svg = d3.select("#company-location")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,0)");

    var projection = d3.geo.mercator()
        .center([107, 31])
        .scale(700)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);


    d3.json("/geojson/china.geojson", function (error, root) {

        if (error)
            return console.error(error);

        //console.log(root.features);

        svg.selectAll("path")
            .data(root.features)
            .enter()
            .append("path")
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("fill", function (d, i) {
                if (res[d.properties.name])
                    return color(colorLinear(res[d.properties.name]));
                else
                    return color(colorLinear(0));
            })
            .attr("d", path)
            .attr('title', function (d) {
                if (res[d.properties.name])
                    return d.properties.name + ':' + res[d.properties.name];
                else
                    return d.properties.name + ':' + 0;
            })
            .on("mouseover", function () {
                d3.select(this).attr("fill", "yellow");
            })
            .on("mouseout", function (d) {
                if (res[d.properties.name])
                    d3.select(this).attr("fill", color(colorLinear(res[d.properties.name])));
                else
                    d3.select(this).attr("fill", color(colorLinear(0)));
            });

    });

    // the linear
    var defs = svg.append('defs');

    var linearGradient = defs.append('linearGradient')
        .attr('id', 'linearColor')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');

    var stops = linearGradient.append('stop')
        .attr('offset', '0%')
        .style('stop-color', a.toString());

    var stops = linearGradient.append('stop')
        .attr('offset', '100%')
        .style('stop-color', b.toString());

    var colorRect = svg.append('rect')
        .attr('x', 20)
        .attr('y', 575)
        .attr('width', 125)
        .attr('height', 30)
        .style('fill', "url(#" + linearGradient.attr("id") + ")");

    var minValueText = svg.append('text')
        .attr('class', 'valueText')
        .attr('x', 20)
        .attr('y', 575)
        .attr('dy', '-0.3em')
        .text(function() { return minValue; });

    var maxValueText = svg.append('text')
        .attr('class', 'valueText')
        .attr('x', 150)
        .attr('y', 575)
        .attr('dy', '-0.3em')
        .text(function() { return maxValue ;});
}
