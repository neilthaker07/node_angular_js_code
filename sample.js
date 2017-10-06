  // NEIL
    $scope.memorySet = function(){
      sharedService.memoryBroadcast();
    };
// NEIL


//NEIL
  sharedService.memoryBroadcast = function() {
      $rootScope.$broadcast('memorySetDash');
  };
  //NEIL



  //NEIL
    $scope.$on('memorySetDash', function() {
      var flowData = getDataFlowFunction();
        $http({
            method : 'POST',
            url: '/memorizeConfig',
            data:{
                  'mainFlow' : flowData
            }
        }).then(function (res) {
            if(res.status == 200){
                console.log(res);
            }else{
                console.log(res.status);
            }
        },function (err) {
            console.log(err);
        });
    });
    //NEIL





  // NEIL
      $scope.getDataFlowInfo = function () {
         console.log("----$rootScope.deletedDashList---");
         console.log($rootScope.deletedDashList);
         console.log($rootScope.deletedDashList.length);
         console.log("----$rootScope.deletedDashList---");

         var mainFlow = {};
         var keyValuesList = [];

         for (var i = 0; i < $rootScope.deletedDashList.length; i++)
         {
           var widget = document.getElementsByClassName("grid-stack-item ui-draggable ui-resizable ui-resizable-autohide");
           var xCo = widget[0].attributes[5].nodeValue;
           var yCo = widget[0].attributes[6].nodeValue;
           var width = widget[0].attributes[7].nodeValue;
           var height = widget[0].attributes[8].nodeValue;
           console.log(widget+" : "+"x:"+xCo+" : "+yCo+" : "+width+" : "+height);

           var dataflowName = $rootScope.deletedDashList[i].name;
           var dataflowSeqId = $rootScope.deletedDashList[i].seqId;
           console.log(dataflowName+" : "+"name: , seq id: "+dataflowSeqId);

           var cookie1 = new RegExp(dataflowName+"fromDate" + "=([^;]+)");
           var fdCookie = cookie1.exec(document.cookie);
           fdCookie = (fdCookie != null) ? unescape(fdCookie[1]) : null;

           var cookie2 = new RegExp(dataflowName+"toDate" + "=([^;]+)");
           var tdCookie = cookie2.exec(document.cookie);
           tdCookie = (tdCookie != null) ? unescape(tdCookie[1]) : null;

           console.log(fdCookie);
           console.log(tdCookie);
           console.log("---Dates COOKIE--------");

           var keyValues = {};
           keyValues["name"]=dataflowName;
           keyValues["seqId"]=dataflowSeqId;
           keyValues["xCo"]=xCo;
           keyValues["yCo"]=yCo;
           keyValues["width"]=width;
           keyValues["height"]=height;
           keyValues["fromDate"]=fdCookie;
           keyValues["toDate"]=tdCookie;

           console.log("---keyValues--++++++");
           console.log(keyValues);

           keyValuesList[i] = keyValues;
         }
         mainFlow["memoryFlows"] = keyValuesList;
         console.log("---mainFlow--++++++");
         console.log(mainFlow);
         return mainFlow;
      };
      // NEIL




// NEIL
    function getDataFlowFunction() {
        return $scope.getDataFlowInfo();
    };
    // NEIL





    // NEIL date pass
    res.cookie(fileName+"fromDate", fromDate);
    res.cookie(fileName+"toDate", toDate);
  // NEIL date pass




  <li>
                                <a href="" ng-click="memorySet()"><i class="fa fa-tachometer"></i>SET</a>
                            </li>
                            <li>
                                <a href="" ng-click="memoryM1()"><i class="fa fa-tachometer"></i>M1</a>
                            </li>




app.post('/memorizeConfig', dashboardCtrl.memorizeConfig); // NEIL service




// NEIL-memorize
exports.memorizeConfig = function (req, res) {

    var resJSON = {};
    var saveData = req.body.mainFlow;

    console.log("*-*-*-*-*-*-**-*--");
    console.log("---saveData--++++++");
    console.log(saveData);
    console.log("*-*-*-*-*-*-**-*--");

    res.send(saveData);
    /*var fromDate = req.body.fromDate;
    var toDate = req.body.toDate;*/

    //export that info in json
    fs.writeFile('./neil_task.json', JSON.stringify(saveData), 'utf-8', function(err) {
       if (err) throw err
        console.log('memorized right data flows! Done!')
      });
}
// NEIL-memorize



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
