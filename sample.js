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
















  $scope.addDateFilter = function (seqId, fromDate, toDate) { // NEIL
    

      response=response+'<div id=tileNo ng-init="tileNo='+seqId+'"; startDate='+fromDate+'"; endDate='+toDate+'"></div></div>';
          


          indexAngularApp.controller('alarmAnalysisCtrl', function ($scope,$rootScope, $http, $sce, $compile, sharedService) {

    //$scope.date = {startDate: null, endDate: null};
    $scope.date = {startDate: startDate, endDate: endDate};
    $scope.showCal=1;
  





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

    $scope.$on('memoryGetDash', function() {
        $http({
            method : 'POST',
            url: '/showMemorizeConfig',
            data:{
                  'mainFlow' : ""
            }
        }).then(function (res) {
            if(res.status == 200){
                console.log("--after getting response - 200 - memoryGetDash--");
                console.log(res.data);
                var dash = res.data;
                createDashboard(dash);
                console.log("--after getting creation, next refresh save dashboard");
                refreshSavedDashboard(dash);
            }else{
                console.log(res.status);
            }
        },function (err) {
            console.log(err);
        });
    });
    //NEIL
    //addLiveLineChart();











      function refreshSavedDashboard(allFlows) {
      console.log("just in refreshSavedDashboard");
      var flows = allFlows["memoryFlows"];
      console.log("---------flows---------");
      console.log(flows);

      for(var i=0; i<flows.length; i++)
      {
        var eachFlow = {};
        eachFlow = flows[i];

        var dataFlowName = eachFlow["name"];
        var fromDate = eachFlow["fromDate"];
        var toDate = eachFlow["toDate"];
        var seqId = eachFlow["seqId"];

        var element = document.getElementById('FILL'+(seqId));
        console.log("--inside element-----"+seqId);
        var element2=element.getElementsByTagName('stacked-bar-chart');
        if (element2.length == 0)
          element2=element.getElementsByTagName('pareto-chart');
        $(element2).remove();
        var level=0;
        var element3=element.getElementsByTagName('button');
        if (element2.length == 0)
          level=0;
        else level=1;

        var dash = eachFlow;
        console.log("-----IMP-2--------");
        console.log(dash);
        console.log("-----IMP-2--------");
        $http({
            method : 'POST',
            url: '/getDashConfig',
            data:{
                'dashName' : dataFlowName,
                'fromDate':$scope.fromDate,
                'toDate':$scope.toDate
            }
        }).then(function (res) {
            if(res.status == 200){
                console.log("ACTUAL NEED - -----------NEED-------");
                console.log(res);
                dash.paramJSON = res.data;
                dash.paramJSON.seqId = dash.seqId;
                dash.chartLevel=level;

                sharedService.refreshDashBroadcast(dash);
            }else{
                console.log(res.status);
            }
        },function (err) {
            console.log(err);
        });
      }
      console.log("end in the refreshSavedDashboard");
    };

    // NEIL
    function getDataFlowFunction() {
        return $scope.getDataFlowInfo();
    };
    // NEIL




















//NEIL
            //dashName
            // here here here
            console.log("here here here ");
            console.log(req.body.drillDownID+ " : "+ req.body.drillDownVariable+" : "+req.body.drillDownValue+": "+req.body.level);
            console.log("here here here ");

            var drillList = [];
            var drillDownLength = req.body.existingDrillCookie.length;
            console.log("here here here-------------------- "+!req.body.existingDrillCookie);
            console.log(drillDownLength);
            if(!req.body.existingDrillCookie) {
              drillList = existingDrillCookie;
            }
            var drillMap = {};
            drillMap[fileName+"drillDownID"] = req.body.drillDownID;
            drillMap[fileName+"drillDownVariable"] = req.body.drillDownVariable;
            drillMap[fileName+"drillDownValue"] = req.body.drillDownValue;
            drillMap[fileName+"level"] = req.body.level;
            console.log("qwet : ");
            var t = drillList.length<1 ? 0 : drillList.length;
            drillList[0] = drillMap;

            res.cookie(fileName+"drillDownID", drillList);
            /*res.cookie(fileName+"drillDownID", req.body.drillDownID);
            res.cookie(fileName+"drillDownVariable", req.body.drillDownVariable);
            res.cookie(fileName+"drillDownValue", req.body.drillDownValue);
            res.cookie(fileName+"level", req.body.level);*/
//NEIL






//NEIL
                        var existingDrill = new RegExp(resJSON.name+"drillDownID");
                        var existingDrillCookie = existingDrill.exec(document.cookie);
                        existingDrillCookie = (existingDrillCookie != null) ? unescape(existingDrillCookie[1]) : null;
                        console.log("*+*+"+existingDrillCookie);
//NEIL
                        $http({
                          method : 'POST',
                          url: '/getDashConfig',
                          data:{
                              'dashName' : resJSON.name,
                              "drillDownID" : resJSON.drillDownID,
                              "drillDownVariable" : resJSON.drillDownVariable,
                              "drillDownValue" : drillDownValue,
                              "level": resJSON.level,
                              "existingDrillCookie":existingDrillCookie //NEIL
                          }