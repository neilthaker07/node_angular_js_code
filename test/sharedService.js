angular.module('indexAngularApp').factory('sharedService', function($rootScope) {
  var sharedService = {};
  var turnOffSeqId = 0;
  var removeSeqId = 0;
  var mem_name = "";
  var flowname = "";
  var bunchName = "";
  sharedService.dash = {};
  sharedService.addDashBroadcast = function(dash) {
      this.dash = dash;                               //Need to create some different function when loading saved dashes async
                                                      //this reference would be overwritten when multiple dashes are created asynclly.
      $rootScope.$broadcast('handleAddDash');
  };

  sharedService.refreshDashBroadcast = function(dash) {
      this.dash = dash;                               //Need to create some different function when loading saved dashes async
                                                      //this reference would be overwritten when multiple dashes are created asynclly.
      $rootScope.$broadcast('handleRefreshDash');
  };

  sharedService.removeDashBroadcast = function(seqId) {
      this.removeSeqId = seqId;
      $rootScope.$broadcast('handleRemoveDash');
  };

  sharedService.turnOffDash = function(seqId) {
      this.turnOffSeqId = seqId;
      $rootScope.$broadcast('handleTurnOffDash');
  }
  //NEIL
  sharedService.memoryBroadcast = function(mem_name) {
      this.mem_name = mem_name;
      $rootScope.$broadcast('memorySetDash');
  };

  sharedService.memoryGetBack = function(flowname) {
    this.flowname = flowname;
    $rootScope.$broadcast('memoryGetDash');
  };

  sharedService.deleteSelectedBunchOfFlows = function(bunchName) {
    this.bunchName = bunchName;
    $rootScope.$broadcast('deleteBunch');
  };
  //NEIL

  return sharedService;
});
