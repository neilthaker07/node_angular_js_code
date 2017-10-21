indexAngularApp.directive('stackedBarChart', function($window, $http, $compile,sharedService){
    return{
        restrict:'EA',
        template: function(elem, attrs,scope){
            return getTwelveColPanel(attrs);
        },
        link: function(scope, elem, attrs){
            var stackedBarChartParamJSON = scope.stackedBarChartParamJSON;
            var refreshData=scope.refreshData;

            var drawChart = function(resJSON,refreshData){
                console.log("-----D3 JS------------------------------");
                console.log("-----D3 JS------------------------------");
                console.log("-----D3 JS------------------------------");
                console.log("Data here");
                console.log(resJSON);
                var barTypes = resJSON.resJSON.barTypes;
                var dataArray = resJSON.resJSON.dataArray;
                var colorArray = resJSON.resJSON.colorArray;
                var axisLabels = resJSON.resJSON.axisLabels;
                var margin = {
                    top : 20,
                    right : 200,                //..........Changes here.......//
                    bottom : 80,
                    left : 50
                };
                var height = 350 - margin.top - margin.bottom;//document.getElementById('chart-div').clientHeight - margin.top - margin.bottom;
                var width = 700 - margin.right - margin.left;//document.body.clientWidth - margin.right - margin.left;


                var d3 = $window.d3;
                var rawSvg=elem.find('svg');
                var svg = d3.select(rawSvg[0])
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .attr("id", "stacked-bar-chart-svg")
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var x = d3.scale.ordinal()
                    .rangeRoundBands([0, width]);

                var y = d3.scale.linear()
                    .rangeRound([height, 0]);



                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");
                //.tickFormat(d3.time.format("%b"));

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                var layers = d3.layout.stack()(barTypes.map(function(c) {
                    return dataArray.map(function(d) {
                        return {x: d.xVal, y: d[c]?d[c]:0};
                    });
                }));

                /*
                var layers = d3.layout.stack()(barTypes.forEach(function(c) {
                    return Object.keys(dataArray).forEach(function(d) {
                        console.log("***************"+dataArray[d][c]);
                        if(!dataArray[d][c]){
                            return {x: d, y: 0};
                        }
                        return {x: d, y: dataArray[d][c]};
                        return {x:d,y:0}
                    });
                }));
                */


                x.domain(layers[0].map(function(d) { return d.x; }));
                y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

                var layer = svg.selectAll(".layer")
                    .data(layers)
                    .enter().append("g")
                    .attr("class", "layer")
                    .style("fill", function(d, i) {  return colorArray[i]; });

                layer.selectAll("rect")
                    .data(function(d) { return d; })
                    .enter().append("rect")
                    .attr("x", function(d) { return x(d.x); })
                    .attr("y", function(d) { return y(d.y + d.y0); })
                    //.attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
                    .attr("width", x.rangeBand() - 1)

                    .on('click',function(d) {
                      if(resJSON.drillDownID){
                        //console.log(d);
                        //scope.addLineChartAA([], "Daily Alarm Rate for each Recipe", "linechartaa1", 1);
                        // var div1 = angular.element(document.getElementById('div-1'));
                        // div1.empty();
                        //
                        //
                        // //Add directive for the next block
                        // var el1 = $compile('<line-chartaa panelid="temppid2" paneltitle = "Daily Alarm Rate for each Recipe" panelsize="XL"></line-chartaa>')(scope);
                        // div1.append(el1[0]);
                        //********************************* Testing Start*********************
                        var drillDownValue ;
                        if(resJSON.drillDownVariable=='lotStartDate')
                        {
                            var nextDate = moment(d.x,"x").add(1,resJSON.duration);

                            drillDownValue = [d.x,nextDate.unix()*1000];
                            console.log(nextDate.unix());
                        }
                        else
                        {
                           drillDownValue = d.x;
                        }
                        $http({
                          method : 'POST',
                          url: '/getDashConfig',
                          data:{
                              'dashName' : resJSON.name,
                              "drillDownID" : resJSON.drillDownID,
                              "drillDownVariable" : resJSON.drillDownVariable,
                              "drillDownValue" : drillDownValue,
                              "level": resJSON.level
                          }
                      }).then(function (res) {
                          if(res.status == 200){


                              //dash.paramJSON = res.data;
                              //dash.paramJSON.seqId = dash.seqId;
                              var dash = {};
                              dash.paramJSON = res.data;
                              dash.paramJSON.seqId = parseInt(attrs.panelid[0]);
                              dash.seqId = parseInt(attrs.panelid[0]);
                              sharedService.refreshDashBroadcast(dash);
                              console.log(sharedService);
                          }else{
                              console.log(res.status);
                          }
                      },function (err) {
                          console.log(err);
                      });
                    }else{
                      //********************************* Testing  Ends********************
                      console.log("Flow is over");
                    }
                    })
                    .attr("height", 0)
                    .transition()
                    .duration(200)
                    .delay(function (d, i) {
                        return i * 100;
                    })
                    .attr("y", function (d, i) {
                        return y(d.y + d.y0);
                    })
                    .attr("height", function (d, i) {
                        return y(d.y0) - y(d.y + d.y0);
                    });

                svg.append("g")
                    .attr("class", "axis x")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .attr("y", 0)
                    .attr("x", 9)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(90)")
                    .style("text-anchor", "start");

                svg.append("g")
                    .attr("class", "axis y")
                    .call(yAxis);


                console.log(scope.stackedBarChartParamJSON);
                // Add the text label for the x axis
                svg.append("text")
                    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
                    .style("text-anchor", "middle")
                    .text(resJSON.xaxisLabel);

                // Add the text label for the Y axis
                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 0 - margin.left)
                    .attr("x",0 - (height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .text(resJSON.barLabel);



                // Draw legend
                var keys = barTypes;
                //keys.shift();
                var legend = svg.selectAll(".legend")
                    .data(keys.slice())
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function(d, i) {
                        return colorArray[i];
                    });

                legend.append("text")
                    .attr("x", width + 5)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .text(function(d) { return d;});

            };

            drawChart(stackedBarChartParamJSON,refreshData);
        }



    };
});
