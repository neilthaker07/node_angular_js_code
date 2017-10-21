indexAngularApp.controller('dashBoardCtrl', function($scope,$rootScope,$http,$sce,$compile,sharedService){
  ko.components.register('dashboard-grid', {
      viewModel: {
          createViewModel: function (controller, componentInfo) {
              var ViewModel = function (controller, componentInfo) {
                  var grid = null;

                  this.widgets = controller.widgets;

                  this.hello="Helooo";

                  this.afterAddWidget = function (items) {
                      if (grid == null) {
                          grid = $(componentInfo.element).find('.grid-stack').gridstack({
                              auto: false
                          }).data('gridstack');
                      }

                      var item = _.find(items, function (i) { return i.nodeType == 1 });
                      grid.addWidget(item);
                      ko.utils.domNodeDisposal.addDisposeCallback(item, function () {
                          grid.removeWidget(item);
                      });
                  };
              };

              return new ViewModel(controller, componentInfo);
          }
      },
      template:
          [
              '<div class="grid-stack" data-bind="foreach: {data: widgets, afterRender: afterAddWidget}">',
              '   <div class="grid-stack-item" data-bind="attr: {\'data-gs-x\': $data.x, \'data-gs-y\': $data.y, \'data-gs-width\': $data.width, \'data-gs-height\': $data.height, \'data-gs-auto-position\': $data.auto_position}", \'data-toggle\':"modal" \'data-target\':"#myModal>',
              '       <div data-bind="attr: {\'id\':\'FILL\'+$data.count}" class="grid-stack-item-content" ><button style="background-color:transparent; border-color:transparent; margin-top:15px;" data-bind="click: $root.deleteWidget, attr: {\'background-color\': \'transparent\'}"> <img src="/js/angular/delete.svg"/ height="20px;"></button></div> ',
              '   </div>',
              '</div> '
          ].join('')
  });

//data-bind="attr: {\'id\':\'FILL\'+$data.count}"
  var Coontroller = function (widgets) {
    var vm = this;
    vm.persons = [
    ];
      var self = this;
      $scope.count=0;

      this.widgets = ko.observableArray(widgets);
      this.deletedWidgets=ko.observableArray([]);

      this.foodPlan="";//"";
       this.weightPlan="weight";
      this.friendsPlan=false;

      //tempArr=["Apple","Banana"];


      //document.getElementById('mySidenav').innerHTML=document.getElementById('mySidenav').innerHTML+'<a href="#" data-bind="click: addNewWidget, text: $data.foodPlan"></a>';
      $scope.addNewWidget = function (seqId) {

              $scope.count=$scope.count+1;
              //if(($scope.count%2)!=0)
                self.widgets.push({x: (0+(($scope.count+1)%2)*6), y: (0+($scope.count/2)*7), width: 6, height: 7, count: seqId, seqid: seqId, text: "Food Plan", img: "/modules/core/client/img/friends.svg"});

          return false;
      };
      $scope.addDateFilter = function (seqId, fromDate, toDate) { // NEIL
        $.ajax({
          url: '/js/angular/alarmanalysisForTile.ejs',
          data: {
             fromDate: fromDate,
             toDate: toDate
           },
          async: false,
          success: function (response) {
            // do stuff with response.
            console.log(response);
            response=response+'<div id=tileNo ng-init="tileNo='+seqId+'"></div></div>';
            var dashboardDiv = angular.element(document.getElementById('FILL'+seqId));
            dashboardDiv.append($compile(response)($scope));
            //$scope.$apply();
          }
        });
      }

      $scope.addSavedWidget = function (eachFlow) {
        var flowName = eachFlow["name"];
        var seqId = eachFlow["seqId"];
        var xCo = eachFlow["xCo"];
        var yCo = eachFlow["yCo"];
        var w = eachFlow["width"];
        var h = eachFlow["height"];

        $scope.count=$scope.count+1;
        self.widgets.push({x: xCo, y: yCo, width: w, height: h, count: seqId, seqid: seqId, text: "Food Plan", img: "/modules/core/client/img/friends.svg"});

        return false;
      };

      this.deleteWidget = function (item) {
         console.log(self.deletedWidgets().length);
          self.deletedWidgets.push(item);

          vm.persons.push(item.text);
          $scope.$apply();
          $scope.removeDashNew(item.seqid);
          self.widgets.remove(item);
          //adding loop
          for (var i = 0; i < $rootScope.deletedDashList.length; i++) {
                  if ($rootScope.deletedDashList[i].seqId == (item.seqid)){
                    $rootScope.dashList.push($rootScope.deletedDashList[i]);
                    $rootScope.deletedDashList.splice(i, 1);
                    $scope.count=$scope.count-1;
                    $scope.$apply();
                    break;
                  }
              }
          //adding loop

          console.log("Pushing and deleting");
          console.log(self.deletedWidgets().length);


          return false;
      };

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
           var xCo = widget[i].attributes[5].nodeValue;
           var yCo = widget[i].attributes[6].nodeValue;
           var width = widget[i].attributes[7].nodeValue;
           var height = widget[i].attributes[8].nodeValue;
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
           keyValues["filename"]=sharedService.mem_name;
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

  };

/*  var widgets = [
      {x: 0, y: 0, width: 5, height: 4, index: 1, text: "Food Plan", img: "/modules/core/client/img/friends.svg"},
      {x: 5, y: 0, width: 5, height: 4, index: 2, text: "Diet Plan", img: "/modules/core/client/img/food.svg"},
      {x: 0, y: 4, width: 5, height: 4, index: 3, text: "Calories consumed", img: "/modules/core/client/img/orangemeter.svg"},
      {x: 5, y: 4, width: 5, height: 4, index: 4, text: "Calorie count", img: "/modules/core/client/img/yellowmeter.svg"},
      {x: 6, y: 0, width: 3, height: 6, index: 5, text: "Excercise plan", img: "/modules/core/client/img/girl.svg"},
      {x: 9, y: 0, width: 3, height: 6, index: 6, text: "Diet count", img: "/modules/core/client/img/friends.svg"}
  ];*/
  var widgets = [];
  var controller = new Coontroller(widgets);
  ko.applyBindings(controller);

  //KO code

/*  $(document).ready(function() {
    setTimeout(function() {
      var sampleObj='{"barTypes":["KEO302","KEO303","KEO301","KEO304"],"dataArray":[{"xVal":1410158998562,"KEO302":23,"KEO301":21,"KEO303":0,"KEO304":0},{"xVal":1410159098662,"KEO302":132,"KEO301":23,"KEO303":0,"KEO304":0},{"xVal":1410159198762,"KEO303":10,"KEO304":15,"KEO302":0,"KEO301":0},{"xVal":1410159298862,"KEO303":23,"KEO304":60,"KEO302":0,"KEO301":0},{"xVal":1410159398962,"KEO302":43,"KEO301":114,"KEO303":0,"KEO304":0}],"colorArray":["#79c9f7","#81d0ef","#7d79f2","#6a9cd1"]}';
      d3.selectAll("grid-stack-item-content").append(drawChart(JSON.parse(sampleObj)));
    }, 100);
  });*/


    //-------------ADD CHART DIRECTIVES------------------//
    var addStackBarChart = function(paramJSON,seqId,name,tileName,refreshData){
  /*console.log("IN IN STACKED BAR CHART");
      console.log("IN IN STACKED BAR CHART");
      console.log("IN IN STACKED BAR CHART");
      console.log("IN IN STACKED BAR CHART");
      */  $scope.stackedBarChartParamJSON = paramJSON;
        $scope.stackedBarChartParamJSON.name=tileName;
        $scope.refreshData=refreshData;
        //var panelTitle = paramJSON.chartUIArr[0].title;
        var panelTitle = name;//paramJSON.label;
        var panelId = name;//"panelid-"+ seqId;
        $scope.allCharts.push(panelId);
        var el = $compile('<stacked-bar-chart panelid="' + panelId + '" paneltitle = "' + panelTitle+ '"refreshdata=\''+refreshData+'\'></stacked-bar-chart>')($scope);
        var dashboardDiv = angular.element(document.getElementById('FILL'+seqId));
        dashboardDiv.append(el[0]);
    };
    var addLiveLineChart = function () {
        $scope.titleLiveLineChart = "Live";
        var el = $compile('<live-line-chart></live-line-chart>')($scope);
        var dashboardDiv = angular.element(document.getElementById('dashboard'));
        dashboardDiv.append(el[0]);
    };
    var addLineChart = function (paramJSON,seqId,name,tileName) {
        $scope.lineChartParamJSON = paramJSON;
        $scope.lineChartParamJSON.name=tileName;
        var panelTitle = name;//paramJSON.chartUIArr[0].title;
        var panelId = name;//"panelid-" + seqId;
        $scope.allCharts.push(panelId);
        var el = $compile('<line-chart panelid="' + panelId +'" paneltitle = "' + panelTitle + '"></line-chart>')($scope);
        var dashboardDiv = angular.element(document.getElementById('FILL'+seqId));
        dashboardDiv.append(el[0]);
    };

    var addParetoChart = function (paramJSON,seqId,name,tileName,refreshData) {
        //compile the directive
        $scope.paretoChartParamJSON = paramJSON;
        $scope.paretoChartParamJSON.name=tileName;
        var panelId = name;//"panelid-" + seqId;
        $scope.allCharts.push(panelId);
        //var chartId = name;
        var panelTitle = name;
        var el = $compile('<pareto-chart ' + 'paneltitle="'+panelTitle+'" '+'panelid="'+panelId+'" ></pareto-chart>')($scope);
        var dashboardDiv = angular.element(document.getElementById('FILL'+seqId));
        dashboardDiv.append(el[0]);
    };

    var addWaferTrace = function (paramJSON,seqId,name,level,chartId,parentId) {
        $scope.ganttChartParamJSON = paramJSON
        var panelTitle = "Title Gantt";
        var panelId = name;//"panelid-" + seqId;
        $scope.allCharts.push(panelId);
        console.log(seqId);
        var el = $compile('<wafertrace-chart-device ' + 'paneltitle="'+panelTitle+'" '+'chartLevel="'+level+'" '+'" parentId="'+parentId+'" '+'chartId="'+chartId+'" ' +'panelid="'+panelId+'"></wafertrace-chart-device>')($scope);
        var dashboardDiv = angular.element(document.getElementById('FILL'+seqId));
        dashboardDiv.append(el[0]);
    };

    var addMultipleYAxis = function (paramJSON,seqId,name,level,chartId,parentId) {
        $scope.multipleYAxisParamJSON = paramJSON
        var panelTitle = "Title Gantt";
        var panelId = name;//"panelid-" + seqId;
        $scope.allCharts.push(panelId);
        console.log(seqId);
        var el = $compile('<datalog-chart ' + 'paneltitle="'+panelTitle+'" '+'chartLevel="'+level+'" '+'" parentId="'+parentId+'" '+'chartId="'+chartId+'" ' +'panelid="'+panelId+'"></datalog-chart>')($scope);
        var dashboardDiv = angular.element(document.getElementById('FILL'+seqId));
        dashboardDiv.append(el[0]);
    };

    function createDashboard(dash) {
      // NEIL
      console.log("-------------memoryFlows------------------");
      console.log(dash);
      console.log("--inside create dashboard");
      console.log("memoryFlows" in dash);
      if("memoryFlows" in dash)
      {
        var flows = dash["memoryFlows"];
        for(var i=0; i<flows.length; i++)
        {
            // Remove data flow from left panel and add in deletedDashList
            // Reason is for fetched flows save button should work.
            var t = $rootScope.dashList;
            console.log($rootScope.dashList[0]["name"]);

            t.forEach(function(value){
              if(value["name"] === flows[i]["name"])
              {
                $rootScope.deletedDashList[i] = value;
                var index = $rootScope.dashList.indexOf(value);
                $rootScope.dashList.splice(index, 1);
              }
            });

            $scope.addSavedWidget(dash["memoryFlows"][i]);
            console.log("----------dash dash dash------------------------");
            console.log(dash["memoryFlows"][i]["seqId"]);

            $scope.addDateFilter(dash["memoryFlows"][i]["seqId"], dash["memoryFlows"][i]["fromDate"], dash["memoryFlows"][i]["toDate"]);
        }
      }
      else
      {
        // NEIL
        var paramJSON = dash.paramJSON;
        $scope.addNewWidget(dash.seqId);
        $scope.addDateFilter(dash.seqId, null, null);

        console.log(dash.paramJSON);
      }
      console.log("--end of  create dashboard");
        //sampleBrush(dash.seqId);
    };

    //NEIL
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
    						'toDate':$scope.toDate,
                'dash_use':dash,
                'level':level
    				}
    		}).then(function (res) {
            if(res.status == 200){
                debugger;
                console.log("TESTING 1 2 3 4 --");
                console.log(res.data);
                console.log(res.data.seqId);  //
                console.log(res.data.Name);
                console.log(res.data["Charts"]);

                var dash2={};
                dash2 = res.data.dash_use;
                dash2.paramJSON = res.data;
                dash2.paramJSON.seqId = dash2.seqId;
                dash2.chartLevel= dash2.level;
                /*dash.paramJSON = res.data;
                dash.paramJSON.seqId = res.data.seqId;//dash.seqId;
                dash.chartLevel=level;*/
                console.log("ACTUAL NEED - -----------NEED-------");
                console.log(dash2);
                console.log("ACTUAL NEED - -----------NEED-------");
                console.log(res);

                sharedService.refreshDashBroadcast(dash2);

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

    function sampleBrush(seqId){

      var dashboardDiv = angular.element(document.getElementById('FILL'+seqId));
      dashboardDiv.append('<svg></svg>');

      var margin = {top: 100, right: 50, bottom: 200, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.random.normal(height / 2, height / 8);

var brush = d3.svg.brush()
    .x(x)
    .extent([.3, .5])
    .on("brushstart", brushstart)
    .on("brush", brushmove)
    .on("brushend", brushend);

var label = d3.select('svg').append('div')
    .style('font-family', 'Verdana,Arial,sans-serif')
    .style('font-size', '20px')
    .style({position: 'absolute', bottom: '0px' })
    .attr('id', 'label');

var svg = d3.select("svg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("click", clicked)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var brushg = svg.append("g")
    .call(brush);

brushg.selectAll("rect")
    .attr("height", height)
    .style('fill', '#ccc');

label.html('ready: ' + brush.extent().map(clean));

function clean(d) {
  return d3.round(d,2);
}

function clicked() {
  var extent0 = brush.extent();
  console.log('clicked -- d3.event',  d3.event);
//  label.html(label.html() + '<br>click: ' + brush.extent().map(clean));

  // reset brush width
  if (extent0[0] === extent0[1]) {
    extent0[0] -= .1;
    extent0[1] += .1;
    brushg.call(brush.extent(extent0));
  }
  console.log('clicked -- brush.extent',  brush.extent());

}


    }

    function brushstart() {
      console.log('brushstart -- d3.event',  d3.event);
    //  label.html(label.html() + '<br>start: ' + brush.extent().map(clean));
    }

    function brushmove() {
      console.log('brushmove -- d3.event',  d3.event);
    //  label.html(label.html() + '<br>moving: ' + brush.extent().map(clean));
    }

    function brushend() {
      console.log('brushend -- d3.event',  d3.event);
    //  label.html(label.html() + '<br>end: ' + brush.extent().map(clean));
    }


    function refreshDashboard(dash) {
        var paramJSON = dash.paramJSON;

        console.log(dash.paramJSON);

        var level=dash.chartLevel;
        if (dash.parentId == null)
          dash.parentId=-1;

        for(var i=0;i<paramJSON.Charts.length;i++)
        {
          var chartType = paramJSON.Charts[i].type;
          /*for(var j =0;j<$scope.allCharts.length;j++)
          {
            var ids = $scope.allCharts[j].split("-");
            var seqId = ids[0];
            var level = ids[1];
            console.log(seqId+" "+level+" "+paramJSON.Charts[i].level);
            if(seqId == dash.seqId && paramJSON.Charts[i].level<=level)
            {

              var elm = angular.element(document.getElementById($scope.allCharts[j]));
              //var elm = angular.element(document.getElementById('9-0-0'));
              console.log(elm);
              elm.remove();
            }

          }*/
          //var chartType = "Line";
          switch(chartType){
              case "Line":
                  addLineChart(paramJSON.Charts[i], dash.seqId, dash.seqId+"-"+paramJSON.Charts[i].level+"-"+i, dash.name);
                  break;

              case "Bar":
                  addStackBarChart(paramJSON.Charts[i], dash.seqId, dash.seqId+"-"+paramJSON.Charts[i].level+"-"+i, dash.name,dash.refreshData);
                  break;

              case "lamdemo":
                  addWaferTrace(paramJSON);
                  break;

              case "Pareto":
                  addParetoChart(paramJSON.Charts[i], dash.seqId, dash.seqId+"-"+paramJSON.Charts[i].level+"-"+i, dash.name,dash.refreshData);
                  break;

              case "Gantt":
                  addWaferTrace(paramJSON.Charts[i], dash.seqId, dash.seqId+"-"+paramJSON.Charts[i].level+"-"+i, dash.name);
                  break;

              case "MultipleYAxis":
                  addMultipleYAxis(paramJSON.Charts[i],dash.seqId,dash.name,level,i,dash.parentId);
                  break;

              default:
                  break;
          }
        }

    };


    //-------------REMOVE DASH-----------------------//
    $scope.removeDash = function(panelId){
      var elm = angular.element(document.getElementById(panelId));
        elm.remove();

       var seqId = panelId.split('-')[1];

        console.log(panelId);
        console.log(seqId);
        console.log($scope.allCharts);
        var elm = angular.element(document.getElementById("FILL"+seqId));
        //elm.remove();
        /************************ CodeChange *******************/
        //var children = elm.children("#"+panelId);
        console.log(children);

       sharedService.turnOffDash(seqId);

    }
    $scope.removeDashNew = function(seqId){
        var elm = angular.element(document.getElementById('panelid-'+seqId));
        elm.remove();

        //var seqId = panelId.split('-')[1];

        sharedService.turnOffDash(seqId);

    }
    $scope.zoomIn = function(panelId){

      var elem = document.getElementById(panelId).getElementsByClassName("x_content")[0];
      elem.style.zoom =parseInt(elem.style.zoom.split("%")[0])+10+"%";
      console.log("heyy..");
    }
    $scope.zoomOut = function(panelId){
      var elem = document.getElementById(panelId).getElementsByClassName("x_content")[0];
      elem.style.zoom =parseInt(elem.style.zoom.split("%")[0])-10+"%";
      console.log("heyy..");
    }

$scope.changeFrequency = function(data,id,val){
  var mystring = data.replace(/\*/g, '"');
  console.log(JSON.parse(mystring));
  console.log(val);
  $http({
    method : 'POST',
    url: '/getDashConfig',
    period : val,
    data: JSON.parse(mystring)
}).then(function (res) {
    if(res.status == 200){
      console.log("Hiii");

      var elm = document.getElementById(id);
      //var element2=elm.getElementsByTagName('svg');
      $(elm).remove();
      var dash = sharedService.dash;
      dash.paramJSON = res.data;
      dash.paramJSON.seqId = dash.seqId;
      dash.chartLevel=1;
      //dash.parentId=attrs.chartid;
      //dash.refreshData=postJson;
      sharedService.refreshDashBroadcast(dash);
      console.log(sharedService);
    }
  })
}

$scope.onPlayButtonSelection = function(data,id){
  var mystring = data.replace(/\*/g, '"');
  var obj=JSON.parse(mystring);

  var newDate=obj.drillDownValue[1];

  var nextDate = moment(newDate).add(1,"day");

  var drillDownValue = [newDate,nextDate.unix()*1000];
  console.log(nextDate.unix());
  obj.drillDownValue=drillDownValue;


  //console.log(JSON.parse(mystring));
  //console.log(val);
  $http({
    method : 'POST',
    url: '/getDashConfig',
    //period : val,
    data: obj//JSON.parse(mystring)
}).then(function (res) {
    if(res.status == 200){
      console.log("Hiii");

      var elm = document.getElementById(id);
      //var element2=elm.getElementsByTagName('svg');
      $(elm).remove();
      var dash = sharedService.dash;
      dash.paramJSON = res.data;
      dash.paramJSON.seqId = dash.seqId;
      dash.chartLevel=1;
      //dash.parentId=attrs.chartid;
      //dash.refreshData=postJson;
      sharedService.refreshDashBroadcast(dash);
      console.log(sharedService);
    }
  })
}
    //--------------DASH NAV EVENT LISTENERS----------------------//
    $scope.$on('handleAddDash', function() {
        var dash = sharedService.dash;
        createDashboard(dash);
    });
    $scope.$on('handleRefreshDash', function() {
        var dash = sharedService.dash;
        refreshDashboard(dash);
    });

    $scope.$on('handleRemoveDash', function() {
        var removeSeqId = sharedService.removeSeqId;
        var panelId = 'panelid-' + removeSeqId;
        var elm = angular.element(document.getElementById(panelId));
        elm.remove();
    });

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
                  'mainFlow' : "",
                  'flowname':sharedService.flowname
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


    $scope.$on('deleteBunch', function() {
      var bunchName = sharedService.bunchName;
        $http({
            method : 'POST',
            url: '/deleteConfig',
            data:{
                  'bunchName' : bunchName
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
    //addLiveLineChart();
});
