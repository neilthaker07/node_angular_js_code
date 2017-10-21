indexAngularApp.directive('datalogChart', function($window, $http){
    return{
        restrict:'EA',
        template: function(elem, attrs){
            return getTwelveColPanel(attrs);
        },
        link: function(scope, elem, attrs){

            var drawChart = function(paramJSON){
                console.log(paramJSON);
                var data =  paramJSON.resJSON;
                var noOfChannels = data.length;
                var dataArray = paramJSON.resJSON.dataArray;
// check above line
                var margin = {
                    top : 10,
                    right : 50,                //..........Changes here.......//
                    bottom : 150,
                    left : 50
                };
                var h = 600 - margin.top - margin.bottom;//document.getElementById('chart-div').clientHeight - margin.top - margin.bottom;
                var w = 1500 + (noOfChannels * 25) - margin.right - margin.left;//document.body.clientWidth - margin.right - margin.left;


                var d3 = $window.d3;
                var rawSvg=elem.find('svg');
                var svg = d3.select(rawSvg[0])
                    .attr("width", w + margin.left + margin.right)
                    .attr("height", h + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var channelsValuesArr = [];
                var channelcolors = [];
                var group = [];
                for(var i=0; i < noOfChannels; i++){
                    channelsValuesArr[i] = data[i].values;
                    channelcolors[i] = data[i].channelcolor;
              //      group.push(dataArray[i].groupId);
                }


                var tempValArr = [];
                var allTimeArr = [];
                for(var i=0; i < noOfChannels; i++){
                    var tempTempValArr = [];
                    for(var j = 0; j < channelsValuesArr[i].length; j++ ){
                        //timestamp
                        channelsValuesArr[i][j].timestamp = new Date(channelsValuesArr[i][j].timestamp);
                        allTimeArr.push(channelsValuesArr[i][j].timestamp);
                        //values
                        tempTempValArr.push(parseInt(channelsValuesArr[i][j].val));
                    }
                    tempValArr.push(tempTempValArr);
                }

                // X scale will fit all values from data[] within pixels 0-w
                var date_sort_asc = function (date1, date2) {
                    if (date1 > date2) return 1;
                    if (date1 < date2) return -1;
                    return 0;
                };
                allTimeArr.sort(date_sort_asc);

                var startTime = allTimeArr[0];
                var endTime = allTimeArr[allTimeArr.length - 1];
                var x = d3.time.scale().domain([startTime, endTime]).range([((noOfChannels-1)*25)+3, w]).clamp(true);

                // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
                var y = [];
                for(var i=0; i < noOfChannels; i++){
                    var startVal = d3.min(tempValArr[i]);
                    var endVal = d3.max(tempValArr[i]);
                    y[i] = d3.scale.linear().domain([startVal, endVal]).range([h, 0]);
                }

                // create a line function that can convert data[] into x and y points
                var lines = [];
                for(var i=0; i < noOfChannels; i++){
                    lines[i] = d3.svg.line().interpolate('cardinal')
                        .x(function(d) {return x(d.timestamp);})
                        .y(function(d) {return y[i](d.val);});
                }



                // create yAxis
                var tickFormat = "%m/%d/%y %H:%M:%S.%L";
                var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSize(-h).tickSubdivide(true);
                //  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
                //  .tickSize(8).tickPadding(8);
                // Add the x-axis.
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + (h) + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .attr("y", 0)
                    .attr("x", -3)
                    .attr("dy", "1em")
                    .attr("transform", "rotate(-90)")
                    .style("text-anchor", "end");


                var yAxis = [];
                for(var i = 0; i < noOfChannels; i++){
                    // create left yAxis
                    yAxis[i] = d3.svg.axis().scale(y[i]).ticks(4).orient("left");
                    // Add the y-axis to the left
                    svg.append("g")
                        .attr("class", "y axis")
                        .attr("transform", "translate("+i*25+",0)")
                        .style("fill",channelcolors[i])
                        .call(yAxis[i])
                        .selectAll("text")
                        .attr("y", -3)
                        .attr("x", 0)
                        .attr("dy", "-0.5em")
                        .attr("transform", "rotate(-90)")
                        .style("text-anchor", "middle");
                }

                for(var i=0; i<noOfChannels; i++){
                    svg.append("path")
                        .attr("d", lines[i](channelsValuesArr[i]))
                        .style("stroke",channelcolors[i] )
                        .style("stroke-width", "2")
                        .style("fill", "none");
                }

                //debugger;
                //NEW CODE : NEIL
                var groupIds = {};
                var i2 = 0;
                data.forEach(function(item){
                  groupIds[i2] = item.groupId;
                  i2++;
                });

                var height = 350 - margin.top - margin.bottom;//document.getElementById('chart-div').clientHeight - margin.top - margin.bottom;
                var width = 700 - margin.right - margin.left;

                // Draw legend
                var legend = svg.selectAll(".legend")
                    .data(groupIds)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(30," + i * 19 + ")"; });

                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function(d, i) {
                        return color[i];
                    });

                legend.append("text")
                    .attr("x", width + 5)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .text(function(d) { return d;});
                //NEW CODE : NEIL

            }
            var multipleYAxisParamJSON = scope.multipleYAxisParamJSON;
            drawChart(multipleYAxisParamJSON);
        }
    }

});
