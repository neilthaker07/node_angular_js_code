"use strict";

var d3ChartDataCtrl = require('../controllers/d3ChartDataCtrl');
var alarmDataCtrl = require('../controllers/alarmDataCtrl');
var dashboardCtrl = require('../controllers/dashboardCtrl');

module.exports = function(app){


//--------------------CONTROLLER CALLS-----------------------------------//
    app.get('/getAlarmData', alarmDataCtrl.getAlarms);
    app.get('/getAlarmLotData', alarmDataCtrl.getAlarmsLot);

    app.post('/getAlarmChartData', d3ChartDataCtrl.getAlarmChartData);
    app.post('/getWaferTraceDataWafer',d3ChartDataCtrl.getWaferTraceDataWafer);
    app.post('/getWaferTraceDataDevice',d3ChartDataCtrl.getWaferTraceDataDevice);
    app.post('/getOverlappedData', d3ChartDataCtrl.getOverlappedData);
    app.post('/getNumberofChannels', d3ChartDataCtrl.getNumberOfChannels);
    app.post('/getDatalogData', d3ChartDataCtrl.getDatalogData);
    app.post('/getStackedBarChartData', d3ChartDataCtrl.getStackedBarChartData);
    app.post('/getLiveLineChartData', d3ChartDataCtrl.getLiveLineChartData);
    app.post('/getLineChartData', d3ChartDataCtrl.getLineChartData);
    app.post('/getDashConfig', dashboardCtrl.getDashConfig);
    app.get('/getDashList', dashboardCtrl.getDashList);
    app.post('/memorizeConfig', dashboardCtrl.memorizeConfig); // NEIL service
    app.post('/showMemorizeConfig', dashboardCtrl.showMemorizeConfig); // NEIL service
    app.get('/getFlowList', dashboardCtrl.getFlowList); // NEIL service
    app.post('/deleteConfig', dashboardCtrl.deleteConfig); // NEIL service


//-------------------ALARM ANALYSIS ---------------------------------------//
    app.get('/getDashConfigAA', dashboardCtrl.getDashConfigAA);
    app.get('/getLineChartDataAA', dashboardCtrl.getLineChartDataAA);



//-----------PAGE LOADERS-----------------------------------//

    app.get('/alarmlist', function(req, res){
        res.render('partials/alarmsList');
    });

    app.get('/alarmlot', function(req, res){
        res.render('partials/alarmsLot');
    });

    app.get('/alarmchart', function(req, res){
        res.render('chartpartials/alarmChart');
    });

    app.get('/dashboard', function(req, res){
        res.render('partials/dashboard');
    });

    app.get('/wafertracelamdemo', function (req, res) {
        res.render('partials/flows');
    });

    app.get('/flows', function(req, res){
        res.render('partials/flows');
    });

    app.get('/alarmanalysis', function(req, res){
        res.render('partials/alarmanalysis');
    });


};
