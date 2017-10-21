indexAngularApp.controller('alarmAnalysisCtrl', function ($scope,$rootScope, $http, $sce, $compile, sharedService) {

    $scope.date = {startDate: null, endDate: null};
    //$scope.date = {startDate: $scope.fromDate, endDate: $scope.toDate};
    $scope.showCal=1;
    $scope.opts = {
        applyClass: 'btn-green',
        locale: {
            applyLabel: "Apply",
            fromLabel: "From",
            format: "YYYY-MM-DD HH:mm:ss", //will give you 2017-01-06
            //format: "D-MMM-YY", //will give you 6-Jan-17
            //format: "D-MMMM-YY", //will give you 6-January-17
            toLabel: "To",
            cancelLabel: 'Cancel',
            customRangeLabel: 'Custom range'
        },
        ranges: {
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'Last 6 Months': [moment().subtract(5, 'months'), moment()]
        }
    }

    $scope.dateRangeDisabled = false;

    $scope.toggleDateDiv=function(){
      if ($scope.showCal == 1){
        $scope.showCal=0;
        $scope.$apply();
      }
      if ($scope.showCal == 0){
        $scope.showCal=1;
        $scope.$apply();
      }
    }
    $scope.startFlowWithDate =function(){


        //variables for date ragne picker
        var dateSelected = $scope.date;
        var startDate = dateSelected.startDate._d;
        var endDate = dateSelected.endDate._d;


        var startTime = (new Date(startDate)).toISOString();
        var endTime = (new Date(endDate)).toISOString();

        dateRange = [startTime, endTime];

        //$scope.dateRangeDisabled = true;

        $scope.addParetoCahrt(dateRange, "Installed Base Performance", "pareto1", 0);


    }

    $scope.storeDate1 = {};
    $scope.onTileDateSelection =function(){

        var dateSelected = $scope.date;
        console.log(dateSelected);
        $scope.startDate = dateSelected.startDate._d;
        $scope.endDate = dateSelected.endDate._d;
        console.log($scope.startDate);
        console.log($scope.startDate.getTime());
        var startTime = (new Date($scope.startDate)).toISOString();
        var endTime = (new Date($scope.endDate)).toISOString();
        var element = document.getElementById('FILL'+($scope.tileNo));
        var element2=element.getElementsByTagName('stacked-bar-chart');
        if (element2.length == 0)
          element2=element.getElementsByTagName('pareto-chart');
        $(element2).remove();
        var level=0;
        var element3=element.getElementsByTagName('button');
        if (element2.length == 0)
          level=0;
        else level=1;

        console.log("/*/*/*/***$rootScope.deletedDashList/**//*/");
        console.log($rootScope.deletedDashList);

      var dash = $rootScope.deletedDashList[$scope.tileNo];

      //adding loop
      for (var i = 0; i < $rootScope.deletedDashList.length; i++) {
              if ($rootScope.deletedDashList[i].seqId == $scope.tileNo){
                dash=$rootScope.deletedDashList[i];
                //$scope.$apply();
                break;
              }
          }

          //$scope.dateRangeDisabled = true;
        $http({
            method : 'POST',
            url: '/getDashConfig',
            //timeout: 1500,
            data:{
                  'dashName' : dash.name,
                'fromDate':$scope.startDate.getTime(),
                'toDate':$scope.endDate.getTime()
            }
        }).then(function (res) {
            if(res.status == 200){
                //dash.paramJSON = res.data;
                //dash.paramJSON.seqId = dash.seqId;
                dash.paramJSON = res.data;
                dash.paramJSON.seqId = dash.seqId;
                dash.chartLevel=level;
                console.log(dash);
                sharedService.refreshDashBroadcast(dash);
                /*$rootScope.deletedDashList.push(dash);
                $rootScope.dashList.splice(seqId, 1);
                $scope.$apply();*/
            }else{
                console.log(res.status);
            }
        },function (err) {
            console.log(err);
        });

    }

    /*$scope.onPlayButtonSelection =function(){

        var timeDiff = Math.abs($scope.endDate.getTime() - $scope.startDate.getTime());
        console.log($scope.startDate);
        console.log($scope.endDate);
        var newEndDate=new Date($scope.endDate.getTime()+timeDiff);
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        $scope.startDate=$scope.endDate;
        $scope.endDate=newEndDate

        console.log(timeDiff / (1000 * 3600 * 24));
        console.log($scope.startDate);
        console.log($scope.endDate);
        console.log(diffDays);

        var startTime = (new Date($scope.startDate)).toISOString();
        var endTime = (new Date($scope.endDate)).toISOString();


         var element = document.getElementById('FILL'+($scope.tileNo));
        var element2=element.getElementsByTagName('stacked-bar-chart');
        if (element2.length == 0)
          element2=element.getElementsByTagName('pareto-chart');
        $(element2).remove();

      var dash = $rootScope.deletedDashList[$scope.tileNo];
      //adding loop
      for (var i = 0; i < $rootScope.deletedDashList.length; i++) {
              if ($rootScope.deletedDashList[i].seqId == $scope.tileNo){
                dash=$rootScope.deletedDashList[i];
                //$scope.$apply();
                break;
              }
          }
        //$scope.dateRangeDisabled = true;
        $http({
            method : 'POST',
            url: '/getDashConfig',
            data:{
                  'dashName' : sharedService.dash.name,
                'fromDate':$scope.startDate.getTime(),
                'toDate':$scope.endDate.getTime()
            }
        }).then(function (res) {
            if(res.status == 200){
                //dash.paramJSON = res.data;
                //dash.paramJSON.seqId = dash.seqId;
                console.log(res);
                dash.paramJSON = res.data;
                dash.paramJSON.seqId = dash.seqId;
                sharedService.refreshDashBroadcast(dash);

            }else{
                console.log(res.status);
            }
        },function (err) {
            console.log(err);
        });

    }*/

  $scope.onFFButtonSelection =function(){
    setInterval(function(){$scope.onPlayButtonSelection();},2000);
  }
     $scope.addParetoChart = function (dateRange, panelTitle, panelId, flowIndex) {
        //compile the directive
        var el = $compile('<pareto-chart ' +
            'daterange="'+dateRange+'" ' +
            'paneltitle="'+panelTitle+'" ' +
            'panelid="'+panelId+'" flowindex="'+flowIndex+'"></pareto-chart>')($scope);

        //add the directive element to the first-div
        var aaDiv = angular.element(document.getElementById('aaDiv'));
        //nextDiv.empty();
         aaDiv.append(el[0]);
    }
    $scope.addLineChartAA = function (dateRange, panelTitle, panelId, flowIndex) {
        //compile the directive
        var el = $compile('<line-chartaa ' +
            'daterange="'+dateRange+'" ' +
            'paneltitle="'+panelTitle+'" ' +
            'panelid="'+panelId+'" flowindex="'+flowIndex+'"></line-chartaa>')($scope);

        //add the directive element to the first-div
        var aaDiv = angular.element(document.getElementById('aaDiv'));
        //nextDiv.empty();
        aaDiv.append(el[0]);
    }

});
