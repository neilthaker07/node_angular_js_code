indexAngularApp.controller('navCtrl',function($scope,$rootScope, $http,$sce,sharedService){

    function listAllFlows() {
      $http({
          method : "GET",
          url : '/getFlowList',

      }).then(function(res) {
          if(res.status == 200){
              $rootScope.flowList = res.data;
          }
      },function(err) {
          console.log(err);
      });
    }
    $rootScope.flowList = [];
    $rootScope.dashList = [];
    $rootScope.deletedDashList = [];

    function listAllDashes() {
        $http({
            method : 'GET',
            url: '/getDashList'
        }).then(function (res) {
            if(res.status == 200){
                $rootScope.dashList = res.data;
            }else{
                console.log(res.status);
            }
        },function (err) {
            console.log(err);
        });
    }
    listAllFlows();
    listAllDashes();

    $scope.toggleDash = function(seqId){
      //adding loop
      for (var i = 0; i < $rootScope.dashList.length; i++) {
              if ($rootScope.dashList[i].seqId == seqId){
                seqId=i;
                break;
              }
          }
      //adding loop
        var dash = $rootScope.dashList[seqId];
        var dashName = dash.name;
        if(0){
            $rootScope.dashList[seqId].selected = false;
            sharedService.removeDashBroadcast(seqId);

        }else{
            $rootScope.dashList[seqId].selected = true;

            //dash.level=0;
            $rootScope.deletedDashList.push(dash);
            $rootScope.dashList.splice(seqId, 1);
            sharedService.addDashBroadcast(dash);
            $scope.$apply();

        }
    };
    // NEIL
    $scope.memorySet = function(mem_name){
      sharedService.memoryBroadcast(mem_name);
    };

    $scope.memoryM1 = function(flowname){
      sharedService.memoryGetBack(flowname);
    };

    $scope.IsVisible = false;
    $scope.ShowHide = function () {
        //If DIV is visible it will be hidden and vice versa.
        $scope.IsVisible = $scope.IsVisible ? false : true;
    }

    $scope.SaveFlows = function (mem_name) {
        $scope.IsVisible = false;
        $scope.memorySet(mem_name);

        $rootScope.flowList.push(mem_name);
        listAllFlows(); // to refresh all flows after addition of flow
    }

    $scope.delFlow = function (allFlowList, index, name) {
        sharedService.deleteSelectedBunchOfFlows(name);
        allFlowList.splice(index, 1); // after delete button press, delete flow from list.
    }
// NEIL

    $scope.$on('handleTurnOffDash', function () {
        var turnOffSeqId = sharedService.turnOffSeqId;
        var dash = $rootScope.dashList[turnOffSeqId];
        if(dash.selected){
            $rootScope.dashList[turnOffSeqId].selected = false;
        }
    });
});
