"use strict";

const fs = require('fs');
var eventlogDB = require('../models/eventlogDB');
var alarmlogDB = require('../models/alarmlogDB');
var datalogDB = require('../models/datalogDB');
var Parser = require('expr-eval').Parser;
var graphlib = require('graphlib');
var nodeRedGraph = new graphlib.Graph();
var customsort = require('./customsort');
var HashMap = require('hashmap');
var _ = require("lodash");

//import all charts
var StackedBarChart = require('./chartControllers/StackedBarChart');
var LineChart = require('./chartControllers/LineChart');
var ParetoChart = require('./chartControllers/ParetoChart');
var GanttChart = require('./chartControllers/GanttChart');
var MultipleYAxis = require('./chartControllers/MultipleYAxis');
//var ParetoChart = require('./chartControllers/alarmanalysis/ParetoChart');
var LineChartAA = require('./chartControllers/alarmanalysis/LineChartAA');

exports.getDashList = function (req, res) {
    var dirname = process.env['HOME'] + '/.node-red/lib/flows/';
    var resArr = [];
    var files = fs.readdirSync(dirname);
    var numberOfFiles = files.length;
    var seqId = 0;
    for(var i in files){
        if(files[i] == '.DS_Store'){ //To ignore .DS_Store file created in MacOS
            numberOfFiles--;
            continue;
        }
        var fileJSON = {'seqId': seqId, 'name':files[i], 'selected': false};
        resArr.push(fileJSON);
        seqId++;
        if(resArr.length == numberOfFiles){
            res.send(resArr);
        }
    }
}

// NEIL
exports.getFlowList = function (req, res) {
    var dirname = './saved_flows/';
    var resArr = [];
    var files = fs.readdirSync(dirname);
    var numberOfFiles = files.length;
    for(var i in files){
        if(files[i] == '.DS_Store'){ //To ignore .DS_Store file created in MacOS
            numberOfFiles--;
            continue;
        }
        var fileJSON = {'name':files[i].slice(0, -5)};
        resArr.push(fileJSON);
        if(resArr.length == numberOfFiles){
            res.send(resArr);
        }
    }
}
// NEIL

exports.getDashConfig = function (req, res) {

    var resJSON = {};
    var fileName = req.body.dashName;
    var fromDate = req.body.fromDate;
    var toDate = req.body.toDate;

    if(!fromDate)
    {
        fromDate = new Date("2016-05-13");
    }
    if(!toDate)
    {
        toDate = new Date("2017-06-22");
    }

    // NEIL date pass
    console.log("--------fromDate------no--"+fromDate);
    res.cookie(fileName+"fromDate", fromDate);
    console.log("--------toDate-----no---"+toDate);
    res.cookie(fileName+"toDate", toDate);
    // NEIL date pass

    var dirname = process.env['HOME'] + '/.node-red/lib/flows/';

    var triggerID;
    //triggerID = "75c09a92.a5ff04";
    var returnTriggerID;

    fs.readFile(dirname + fileName, 'utf8', function (error, content) {
        var fileData = JSON.parse(content);

        var currentDash = fileData.ORIGINAL_JSON;

        var flowGraph = graphlib.json.read(fileData.FLOW);
        var dashIndex = 0;

        /* FLOW PROCESSING */
        var z = flowGraph.nodes();

        var startId;
        var level = 0;
        console.log("here here here -------------"+req.body.drillDownID);
        if(req.body.drillDownID)
        {
            startId=req.body.drillDownID;
            console.log("=========>"+req.body.level);
            level = req.body.level+1;
        }
        else
        {
            z.forEach(function(currentNode){
                if(flowGraph.node(currentNode).label.type=="Start"){
                    startId = currentNode;
                    level = 0;
                }
            });
        }

        //startId ='241a0bbb.0720b4';
        var flowGraphIDs = customsort.customsort(flowGraph,flowGraph.node(startId));
        var interval={key:"day"};
        var datasourceJSON = {};
        var expression ="expression";
        var charts = [];
        var queryDB = [];


        // To skip nodes from the graph
        var beginIndex =0;

        if(triggerID)
        {
            for(var i=0;i<flowGraphIDs.length;i++)
            {
                // Do nothing
                if(flowGraph.node(flowGraphIDs[i]).label.id==triggerID)
                {
                    beginIndex=i;
                    break;
                }
            }
        }

        console.log("------flow graph ids all---------"+flowGraphIDs);
        console.log("drillDownID------------------ : "+req.body.drillDownID);

        for(var i=0;i<flowGraphIDs.length;i++)
        //for(var i=beginIndex+1;i<flowGraphIDs.length;i++)
        {
          console.log("------flow graph id one by one---------");
            console.log("flow   "+flowGraph.node(flowGraphIDs[i]).label.name +"  " + flowGraph.node(flowGraphIDs[i]).label.type);
            /*if(flowGraph.node(flowGraphIDs[i]).label.type=="Drilldown")
            {
                returnTriggerID = flowGraph.node(flowGraphIDs[i]).label.id;
                break;
            }*/
            switch(flowGraph.node(flowGraphIDs[i]).label.type)
            {
                case "Events":
                    var config = {};
                    config.name = flowGraph.node(flowGraphIDs[i]).label.name;
                    config.tableName = "eventlogs";
                    config.operation = flowGraph.node(flowGraphIDs[i]).label.operation;

                    var groupbyVariable = "toolId";

                    if(flowGraph.node(flowGraphIDs[i]).label.groupby=="RecipeID")
                    {
                        groupbyVariable = "flowRecipeId";
                    }
                    else if(flowGraph.node(flowGraphIDs[i]).label.groupby=="ToolID")
                    {
                        groupbyVariable = "toolId";
                    }



                    /*config.body = {
                            "size": 0,
                            "query": {
                                "bool": {
                                    "must": [{
                                            "match": {
                                                "eventId": "300636"
                                            }
                                        }
                                    ],

                                    "filter": [{
                                            "range": {
                                                "date": {
                                                    "gte": new Date(fromDate)
                                                }
                                            }
                                        }, {
                                            "range": {
                                                "date": {
                                                    "lte": new Date(toDate)
                                                }
                                            }
                                        }, {
                                            "terms": {
                                                "toolId": ["KEO302", "domino84874"]
                                            }
                                        }
                                    ]
                                }
                            },

                            "aggs": {
                                "dates": {
                                        "date_histogram": {
                                            "field": "date",
                                            "interval": function(){return interval.key;}
                                        },

                                    "aggs": {

                                            "toolIDs": {
                                                "terms": {
                                                    "field": groupbyVariable
                                                },
                                                "aggs": {
                                                    "processedWafers": {
                                                        "nested": {
                                                            "path": "dataNumeric"
                                                        },
                                                        "aggs": {
                                                            "wafer_count": {
                                                                "sum": {
                                                                    "field": "dataNumeric.PJProcessedWaferCount"
                                                                }
                                                            }
                                                        }
                                                    }

                                                }
                                        }

                                    }
                                }
                            }

                        } ; */

                        config.body = {
                            "size":1000,
                            "_source" :["materialId","date","endTime","deviceId","eventId","status","lotId","recipeId"],
                            "query": {
                                "bool": {
                                    "must": {
                                        "match": {
                                            "logtype": "XFR"
                                        }
                                    },
                                    "filter": [{
                                            "terms": {
                                                "toolId": ["ETCL94002"]
                                            }
                                        },
                                        {
                                            "terms": {
                                                "materialId": ["1E636893-14","1E636893-16","1E636893-12","1E636893-10","1E636893-17","1E636893-8"]
                                            }
                                        }
                                    ]
                                }
                            }
                        } ;


                        queryDB.push(config);

                break;
                case "Alarms":
                    var config = {};

                    config.name =flowGraph.node(flowGraphIDs[i]).label.name;
                    config.tableName = flowGraph.node(flowGraphIDs[i]).label.tableName;
                    var groupbyVariable = "toolId";

                    if(flowGraph.node(flowGraphIDs[i]).label.groupby=="RecipeID")
                    {
                        groupbyVariable = "recipeName";
                    }
                    else if(flowGraph.node(flowGraphIDs[i]).label.groupby=="ToolID")
                    {
                        groupbyVariable = "toolId";
                    }
                    /*
                    config.body = {
                                "size": 0,
                                "query": {
                                    "bool": {
                                        "filter": [{
                                                "range": {
                                                    "startTime": {
                                                        "gte": new Date(fromDate)
                                                    }
                                                }
                                            }, {
                                                "range": {
                                                    "startTime": {
                                                        "lte": new Date(toDate)
                                                    }
                                                }
                                            }, {
                                                "terms": {
                                                    "toolId": ["KEO302", "domino84874"]
                                                }
                                            }
                                        ]
                                    }
                                },

                                "aggs": {
                                    "dates": {
                                        "date_histogram": {
                                            "field": "startTime",
                                            "interval": function(){return interval.key;}
                                        },

                                        "aggs": {
                                            "toolIDs": {

                                                "terms": {
                                                    "field": groupbyVariable
                                                }
                                            }

                                        }
                                    }
                                }

                            }  */

                        ///////////////// Config testing for case 1 //////////////



                        var datesJSON  = {};

                        if(flowGraph.node(flowGraphIDs[i]).label.xaxiscol=='lotStartDate')
                        {
                            datesJSON["date_histogram"] = {
                                            "field": "lotStartDate",
                                            "interval": function(){return interval.key;}
                                        };
                        }
                        else
                        {
                            datesJSON["terms"] = {
                                            "field": flowGraph.node(flowGraphIDs[i]).label.xaxiscol
                                        }
                        }

                        datesJSON["aggs"] = {
                                            "toolIDs": {

                                                "terms": {
                                                    "field": flowGraph.node(flowGraphIDs[i]).label.groupby
                                                },
                                                "aggs": {
                                                            "wafer_count": {
                                                                "sum": {
                                                                    "field": "waferCount"
                                                                }
                                                            }
                                                        }
                                            }

                                        };




                        /* Drilldown filtering*/
                        var boolJSON = {
                                        "filter": [{
                                                "range": {
                                                    "lotStartDate": {
                                                        "gte": new Date(fromDate)
                                                    }
                                                }
                                            }, {
                                                "range": {
                                                    "lotStartDate": {
                                                        "lte": new Date(toDate)
                                                    }
                                                }
                                            }/*, {
                                                "terms": {
                                                    "toolId": ["KEO302"]
                                                }
                                            }*/
                                        ]
                                    };



                        if(req.body.drillDownID)
                        {

                            console.log("**********************************************************************************************reached inside drilldown");

                            var mustArray = [];
                            if(req.body.drillDownVariable =='lotStartDate'){
                                mustArray.push({
                                                                            "range": {
                                                                                "lotStartDate": {
                                                                                    "gte": req.body.drillDownValue[0]
                                                                                }
                                                                            }});

                                mustArray.push({
                                                                            "range": {
                                                                                "lotStartDate": {
                                                                                    "lte": req.body.drillDownValue[1]
                                                                                }
                                                                            }
                                                                        });
                            }
                            else{

                                var termsJSON = {};
                                termsJSON[req.body.drillDownVariable] = [req.body.drillDownValue];
                                mustArray.push({
                                            "terms": termsJSON
                                    });
                            }


                            var ifColumnExistJSON = {
                                                    "bool": {
                                                        "should": [{
                                                                "bool": {
                                                                    "must_not": [{
                                                                            "exists": {
                                                                                "field": req.body.drillDownVariable
                                                                            }
                                                                        }
                                                                    ]
                                                                }
                                                            }, {

                                                                "bool": {
                                                                    "must": mustArray
                                                                }
                                                            }

                                                        ]
                                                    }
                                                };


                            boolJSON["must"] = ifColumnExistJSON;

                        }

                        config.body = {
                                "size": 0,
                                "query": {
                                    "bool": boolJSON
                                },

                                "aggs": {
                                    "dates": datesJSON
                                }

                            };

                    queryDB.push(config);
                break;
                case "Data":
                   var config = {};

                   //debugger;

                    config.name =flowGraph.node(flowGraphIDs[i]).label.name;
                    config.tableName = flowGraph.node(flowGraphIDs[i]).label.tableName;
                    config.groupbyCol = flowGraph.node(flowGraphIDs[i]).label.groupby;

                    console.log("*-*-*-*-*-*-*-*-*config name *-*-*-"+config.name);
                    console.log("*-*-*-*-*-*-*-*-*config tableName *-*-*-"+config.tableName);
                    console.log("*-*-*-*-*-*-*-*-*config groupbyCol *-*-*-"+config.groupbyCol);

                    config.body = {
                                    "query": {
                                        "bool": {
                                            "must": {
                                                "match": {
                                                    "toolId": "ETCL94002"
                                                }
                                            },
                                            "filter": [
                                                    /*{
                                                    "terms": {
                                                        "waferId": ["PF634930.03-23"]
                                                        }
                                                    },*/
                                                    {
                                                    "terms": {
                                                        "channelName": [flowGraph.node(flowGraphIDs[i]).label.channelname]//,
                                                        //"field": flowGraph.node(flowGraphIDs[i]).label.groupby
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                };

                    queryDB.push(config);
                break;
                case "ui_chart":
                    var chart = {};
                    chart.type = flowGraph.node(flowGraphIDs[i]).label.chartType;
                    console.log("-------chart-----+++++"+chart.type);
                    chart.label = flowGraph.node(flowGraphIDs[i]).label.label;
                    chart.barDatasource = flowGraph.node(flowGraphIDs[i]).label.barDatasource;
                    chart.lineDatasource = flowGraph.node(flowGraphIDs[i]).label.lineDatasource;
                    chart.xaxisLabel = flowGraph.node(flowGraphIDs[i]).label.xlabel;
                    chart.barLabel = flowGraph.node(flowGraphIDs[i]).label.barlabel;
                    chart.lineLabel = flowGraph.node(flowGraphIDs[i]).label.linelabel;
                    chart.parentID = startId;
                    chart.blockID = flowGraphIDs[i];
                    console.log("-------chart-----+++++"+JSON.stringify(chart));
                    // Code for drill down
                    //console.log(flowGraph.successors(flowGraphIDs[i]));
                    var drillDownID = flowGraph.successors(flowGraphIDs[i])[0];
                    //console.log(flowGraph.node(drillDownID));
                    if(drillDownID && flowGraph.node(drillDownID).label.type == "Drilldown"){
                        chart.drillDownID  = drillDownID;
                        chart.drillDownVariable = flowGraph.node(drillDownID).label.variable;
                    }

                    if(!req.body.blockID)
                    {
                        chart.level = level;
                        charts.push(chart);
                    }
                    else{
                        if(req.body.blockID == flowGraphIDs[i])
                        {
                            chart.level = level;
                            charts.push(chart);
                        }
                    }


                    if(flowGraph.node(flowGraphIDs[i]).label.duration)
                        interval.key = flowGraph.node(flowGraphIDs[i]).label.duration;
                        chart.duration = flowGraph.node(flowGraphIDs[i]).label.duration;



                    break;
                case "End":
                    console.log("End occured");
                    break;
                default:
                    //console.log("reached default");
                    break;
            }


        }


        console.log("*****************************fromDate "+fromDate);
        console.log("toDate   "+toDate);

        console.log("++++++++++++++++++++++++++++++++++++++++++++querydb++++++++++++++++++++");
//        console.log(JSON.stringify(queryDB));
        console.log("++++++++++++++++++++++++++++++++++++++++++++querydb++++++++++++++++++++");
        //interval.key = "day";
        var tempJSON = {};
        var responseArray = [];
        _.each(queryDB,function(queryJSON){
            var datasourceResponse={};
            console.log(JSON.stringify(queryJSON.body));
            if(queryJSON.tableName == "alarmlogs" || queryJSON.tableName == "modulelogs")
            {
              // NEIL NEIL NEIL
        //      console.log("**queryJSON- CODE-*-*-*-*-*-*-*-*-*-*-*-*--**-*");
        //      console.log(JSON.stringify(queryJSON));




                alarmlogDB.getDataForDatasource(queryJSON,function(response){
                    //console.log(JSON.stringify(response));
                    queryJSON.response = response;
                    responseArray.push(response);
                    /*
                    _.each(response["aggregations"]["toolIDs"].buckets,function(groupedJSON){
                        console.log(groupedJSON);
                        _.each(groupedJSON["alarm_counts"].buckets,function(yValueJSON){
                            console.log(yValueJSON);
                        });
                    })

                    */

          //          console.log("///////////////////////////");
          //          console.log("--------response----------"+JSON.stringify(response));



                    if(responseArray.length==queryDB.length){

                        createKeyValueJSONFromResponse();
                        //console.log(JSON.stringify(queryDB));
                    }

                });

            }
            else if(queryJSON.tableName == "eventlogs")
            {
                eventlogDB.getDataForDatasource(queryJSON,function(response){
                    responseArray.push(response);
                    queryJSON.response = response;
                    /*
                    _.each(response["aggregations"]["toolIDs"].buckets,function(groupedJSON){
                        _.each(groupedJSON["wafer_counts"].buckets,function(yValueJSON){
                            console.log(yValueJSON.key+"     "+yValueJSON.processedWafers.wafer_count.value);
                        });
                    });
                    */
                    if(responseArray.length==queryDB.length){

                        //console.log(JSON.stringify(responseArray));
                        createKeyValueJSONFromResponse();
                        //console.log(JSON.stringify(queryDB));
                    }
                });
            }
            else if(queryJSON.tableName == "datalogs")
            {

              // NEIL NEIL NEIL
              console.log("**queryJSON- CODE-*-*-*-*-*-*-*-*-*-*-*-*--**-*");
              console.log(JSON.stringify(queryJSON));

                datalogDB.getDataForDatasource(queryJSON,function(response){
                    responseArray.push(response);
                    queryJSON.response = response;
                    /*
                    _.each(response["aggregations"]["toolIDs"].buckets,function(groupedJSON){
                        _.each(groupedJSON["wafer_counts"].buckets,function(yValueJSON){
                            console.log(yValueJSON.key+"     "+yValueJSON.processedWafers.wafer_count.value);
                        });
                    });
                    */
        //            console.log("///////////////////////////");
        //            console.log("--------response----------"+JSON.stringify(response));

                    if(responseArray.length==queryDB.length){

                        //console.log(JSON.stringify(responseArray));
                        createKeyValueJSONFromResponse();
                        //console.log(JSON.stringify(queryDB));
                    }
                });
            }
        });



        var returnArray = [];
        function createKeyValueJSONFromResponse()
        {

            var totalRecords = 0;
            var recordsProcessed = 0;
            console.log("All response received");


            /*
            // Let's sum total objects
            queryDB.forEach(function(queryDBResp){
                //totalRecords= totalRecords +queryDBResp["response"]["aggregations"]["dates"].buckets.length*
                //    queryDBResp["response"]["aggregations"]["dates"].buckets[0]["toolIDs"].buckets.length;
                queryDBResp["response"]["aggregations"]["dates"].buckets.forEach(function(rows){
                    totalRecords+=rows["toolIDs"].buckets.length;
                });

            });
            */
            //ParetoChart.convertToChartDataFormat();
            //responseArray[0]
            queryDB.forEach(function(queryDBResp){

                tempJSON[queryDBResp.name]={};

                if(queryDBResp["tableName"] == "datalogs")
                {
                    var data = [];
                    //tempJSON[queryDBResp.name] = queryDBResp["response"]["hits"]["hits"];
                     queryDBResp["response"]["hits"]["hits"].forEach(function(individualJSON){
                        var channelName = individualJSON["_source"]["channelName"];

                        var startTime = new Date(individualJSON["_source"]["timestamp"]);
                        var values = individualJSON["_source"]["channelField"].split(",");
                        var channelVal = [];

                        values.forEach(function(value){
                            var val = value.replace('{','').replace('}','').split(":");

                            var time = (startTime.getTime() / 1000) + parseInt(val[0]);
                            var d = new Date(time*1000);
                            //channelVal.push({"timestamp": time*1000, "val": val[1]});
                            tempJSON[queryDBResp.name][d] = {};
                            tempJSON[queryDBResp.name][d][individualJSON["_source"][queryDBResp["groupbyCol"]]] = val[1];
                        });
                        //var jSON = {"channelname": channelName, "values":channelVal};
                        //data.push(jSON);
                     });
                     //tempJSON[queryDBResp.name]["data"] = data;
            //         console.log("&&&&&&&&&&&queryDBResp&&&--------&&&&&&&&&&&&&&&&&&&7");
                    // console.log(JSON.stringify(tempJSON));
                    // console.log(JSON.stringify(queryDBResp));
          //           console.log("&&&&&&&&&&&&&&&&queryDBResp&&&&&&------------&&&&&&&&&&&7");

                }
                else if( queryDBResp["tableName"] == "eventlogs" && queryDBResp["operation"] == "None")
                {
                    var data = [];
                    //tempJSON[queryDBResp.name] = queryDBResp["response"]["hits"]["hits"];
                    queryDBResp["response"]["hits"]["hits"].forEach(function(individualJSON){
                        data.push(individualJSON["_source"]);
                    });
                    tempJSON[queryDBResp.name]["data"] = data;
                }
                else{
                    queryDBResp["response"]["aggregations"]["dates"].buckets.forEach(function(groupedJSON){

                        tempJSON[queryDBResp.name][groupedJSON.key] = {};
                        if(queryDBResp["tableName"] == "eventlogs"){
                            groupedJSON["toolIDs"].buckets.forEach(function(yValueJSON){
                                tempJSON[queryDBResp.name][groupedJSON.key][yValueJSON.key] = yValueJSON["processedWafers"]["wafer_count"]["value"];
                                recordsProcessed++;
                                if(recordsProcessed==totalRecords)
                                {
                                    charts.forEach(processEquation(chart));
                                }
                            });
                        }
                        else if(queryDBResp["tableName"] == "alarmlogs" || queryDBResp["tableName"] == "modulelogs"){

                            console.log(groupedJSON);
                            groupedJSON["toolIDs"].buckets.forEach(function(yValueJSON){
                                if(queryDBResp["tableName"] == "modulelogs"){
                                tempJSON[queryDBResp.name][groupedJSON.key][yValueJSON.key] = yValueJSON["wafer_count"]["value"];
                                }
                                else if(queryDBResp["tableName"] == "alarmlogs"){
                                    tempJSON[queryDBResp.name][groupedJSON.key][yValueJSON.key] = yValueJSON["doc_count"];
                                }
                                recordsProcessed++;
                            });

                        }


                    });
                }
            });


            console.log("---+++Charts-------");
            console.log(JSON.stringify(charts));
            // Processing equation
            charts.forEach(processEquation);

            //console.log(tempJSON);

            var responseJSON = {
                            "Name": fileName,
                            "isDrillDown":true,
                            "dash_use": req.body.dash_use,// NEIL Added for save, memory
                            "level": req.body.level
                        };

            charts.forEach(function(chart, index){
              // NEIL console.log(chart);
              //NEIL  console.log(index);
                if(chart.type=="Pareto")
                {
                    if(tempJSON[""+index+"Line"] || tempJSON[""+index+"Bar"])
                    {
                        var pc = ParetoChart.ParetoChart;
                        pc.convertToChartDataFormat(tempJSON[""+index+"Bar"],tempJSON[""+index+"Line"], function (additionalResJSON) {
                            chart.resJSON = additionalResJSON;
                            sendResponse();
                        });
                    }
                }
                else if(chart.type=="Bar")
                {
                    if(tempJSON[""+index+"Bar"]){
                        var sbc = StackedBarChart.StackedBarChart;
                        sbc.convertToChartDataFormat(tempJSON[""+index+"Bar"], function (additionalResJSON) {
                            chart.resJSON = additionalResJSON;
                            sendResponse();
                        });
                    }
                }
                else if(chart.type=="Line")
                {
                    if(tempJSON[""+index+"Line"]){
                        var lc = LineChart.LineChart;
                        lc.convertToChartDataFormat(tempJSON[""+index+"Line"], function (additionalResJSON) {
                            chart.resJSON = additionalResJSON;
                            sendResponse();
                        });
                    }
                }
                else if(chart.type=="Gantt")
                {
                    if(tempJSON[""+index+"Gantt"]){
                        var lc = GanttChart.GanttChart;
                        lc.convertToChartDataFormat(tempJSON[""+index+"Gantt"], function (additionalResJSON) {
                            chart.resJSON = additionalResJSON;
                            console.log("in chart Gantt");
                            sendResponse();
                        });
                    }
                }
                else if(chart.type=="MultipleYAxis")
                {
                    if(tempJSON[""+index+"MultipleYAxis"]){
                        //NEIL console.log("reached here**********************************");
                        var lc = MultipleYAxis.MultipleYAxis;
                        lc.convertToChartDataFormat(tempJSON[""+index+"MultipleYAxis"], function (additionalResJSON) {
                            chart.resJSON = additionalResJSON;
                            //NEIL console.log("in chart Gantt"+ " in MultipleYAxis ");
                            //console.log(JSON.stringify(additionalResJSON));
                            sendResponse();
                        });
                    }
                }


                function sendResponse(){
                    if(index==charts.length-1)
                    {
                        responseJSON.Charts = charts;
                    /*    console.log("--------responseJSON-------------");
                        console.log(JSON.stringify(responseJSON));
                        console.log("--------responseJSON-------------");*/
                        res.send(responseJSON);

                    }
                }
            });

        }





        var parser = new Parser();
        function processEquation(chart, index){

            if(chart.type == "Pareto"){
                var expression = chart.lineDatasource;
                processChartData(""+index+"Line",expression);
                var expression = chart.barDatasource
                processChartData(""+index+"Bar",expression);
            }
            else if(chart.type == "Bar"){
                var expression = chart.barDatasource
                processChartData(""+index+"Bar",expression);
            }
            else if(chart.type == "Line"){
                var expression = chart.lineDatasource;
                processChartData(""+index+"Line",expression);
            }
            else if(chart.type == "Gantt"){
                var expression = chart.lineDatasource;  // Need to change this
                //var expression = "";
                //processChartData(""+index+"Gantt",expression);
                tempJSON[""+index+"Gantt"] = tempJSON[expression];
            }
            else if(chart.type == "MultipleYAxis"){
                var expression = chart.lineDatasource; // Need to change this
                //var expression = "";
              //  console.log("-------expression-------------"+expression);

                processChartData(""+index+"MultipleYAxis",expression);
                //console.log(tempJSON);
                //tempJSON[""+index+"MultipleYAxis"] = tempJSON[expression];
            }

        }


        function processChartData(chartType,expression){

            var expr = parser.parse(expression);
            var variables = expr.variables();
        /*    console.log(expression); // dl
            console.log("*********************************************************************************");
            console.log(variables);
            console.log(JSON.stringify(tempJSON));
      */      //var equationRecords = _.size(tempJSON[queryDB[0].name]) * groupidVal.length;
            var processEquationRecords = 0;
            _.each(tempJSON[variables[0]],function(valueJSON,timestamp){
                _.each(valueJSON,function(value,key){

                    var tempVariableJSON = {};
                    variables.forEach(function(variableName){

                        if(tempJSON[variableName] &&  tempJSON[variableName][timestamp] && tempJSON[variableName][timestamp][key]){
                            //console.log(tempJSON[variableName][timestamp][key]+"                     "+variableName)
                            tempVariableJSON[variableName] = parseFloat(tempJSON[variableName][timestamp][key]);
                        }
                        else{
                            tempVariableJSON[variableName] = 0;
                        }
                    });
              //      console.log("*+++++++++++++++++++++++++");
              //      console.log("*+++++++tempVariableJSON++++++++++++++++++");

                    if(!tempJSON[chartType]){tempJSON[chartType]={}};
                    if(!tempJSON[chartType][timestamp]){tempJSON[chartType][timestamp]={};}

                    if(expr.evaluate(tempVariableJSON) && expr.evaluate(tempVariableJSON)!='Infinity'){
                        //console.log(tempVariableJSON);
                        tempJSON[chartType][timestamp][key]=expr.evaluate(tempVariableJSON);
                    }
                    else{
                        tempJSON[chartType][timestamp][key]=0;
                    }
              //      console.log(JSON.stringify(tempJSON));
              //      console.log("*+++++++tempVariableJSON++++++++++++++++++");
                    processEquationRecords++;
                    //if(equationRecords==processEquationRecords){
                    //    console.log(tempJSON);
                    //}
                });
            });
        }

        /*
        for(var i=0;i<timeVariable.length;i++)
        {
            expression = expression.replace(timeVariable[i],"("+timeVariable[i]+"2-"+timeVariable[i]+"1)");
        }



        // Code for processing
        var keys = [];
        for(var key in datasourceJSON)
        {
            keys.push(key);
            datasourceJSON[key]["select"].push(joinidColumn);
        }

        var datasource ={};

        var expression = "(t1-t2)/n";

        var variables1 = {"t1":1410159698562,"t2":1410159798562,"n":'30'};

        var parser = new Parser();
        var expr = parser.parse(expression);
        console.log(expr.evaluate(variables1));

        var answerJSON = [];




        var groupIDValsArr = groupidVal.split(',');
        var groupIDCount = new HashMap();
        console.log(groupIDValsArr);


        groupIDValsArr.forEach(function(groupID){
            groupIDCount.set(groupID,0); // To count what result came back
            datasource[groupID] = [];
            for(var i=0;i<keys.length;i++)
            {
                var queryJSON = datasourceJSON[keys[i]];
                queryJSON.groupidColumn = groupidColumn;
                queryJSON.groupID = groupID;
                eventlogDB.getDataForDatasource(queryJSON,function(callbackResult,error){
                    console.log("Got response back");
                    groupIDCount.set(callbackResult.groupID,groupIDCount.get(callbackResult.groupID)+1);
                    console.log(callbackResult.groupID+"    "+groupIDCount.get(callbackResult.groupID));

                    if(callbackResult.result.rows.length > 0)
                    {

                        datasource[callbackResult.groupID].push(callbackResult.result.rows);
                    }



                    var answerJSON = [];
                    if(groupIDCount.get(callbackResult.groupID) ==  keys.length)
                    {
                        console.log(datasource[callbackResult.groupID]);
                        var finalMap = [];
                        datasource[callbackResult.groupID].forEach(function(row){
                            finalMap.push(row.reduce(function(map,obj){
                                if(callbackResult.variableType=="time")
                                    map[obj[joinidColumn]]=obj.date.getTime();
                                else if(callbackResult.variableType=="value")
                                    console.log(obj.data);
                                    //map[obj.jobid]=obj.waferCount;
                                return map;
                            },{}));
                        });

                        console.log("finalmap "+JSON.stringify(finalMap));
                    }
                });
            }
        });

        */

        /*
        for(var i=0;i<3;i++)
        {
            eventlogDB.getDataForDatasource(queryJSON[i],function(result,error){
                console.log("Got response back");
                if(result.rows.length > 0)
                {
                    console.log(result.rows.length);
                    datasource.push(result.rows);
                }

                if(datasource.length==3)
                {

                    datasource[0][0].jobid='1';
                    datasource[0][1].jobid='2';
                    datasource[0][2].jobid='3';
                    datasource[0][3].jobid='4';
                    datasource[0][4].jobid='5';

                    datasource[1][0].jobid='1';
                    datasource[1][1].jobid='2';
                    datasource[1][2].jobid='3';
                    datasource[1][3].jobid='4';
                    datasource[1][4].jobid='5';

                    datasource[2][0].jobid='1';
                    datasource[2][1].jobid='2';
                    datasource[2][2].jobid='3';
                    datasource[2][3].jobid='4';
                    datasource[2][4].jobid='5';

                    datasource[2][0].waferCount='10';
                    datasource[2][1].waferCount='20';
                    datasource[2][2].waferCount='30';
                    datasource[2][3].waferCount='40';
                    datasource[2][4].waferCount='50';

                    //console.log(datasource);

                    //var map = new HashMap();
                    var finalMap = [];
                    for(var i=0;i<datasource.length;i++)
                    {
                        finalMap.push(datasource[i].reduce(function(map,obj){
                            if(i==0 || i==1)
                                map[obj.jobid]=obj.date.getTime();
                            else
                                map[obj.jobid]=obj.waferCount;
                            return map;
                        },{}));
                    }

                    for(var i=0;i<datasource[0].length;i++)
                    {
                        var variables= {};
                        //for(var j=0;j<datasource.length;j++)
                        //{
                        variables.t1 = finalMap[0][datasource[0][i].jobid];
                        variables.t2 = finalMap[1][datasource[0][i].jobid];
                        variables.n = finalMap[2][datasource[0][i].jobid];
                        //}
                        answerJSON.push({"jobid":datasource[0][i].jobid,"output":expr.evaluate(variables)});
                    }

                    console.log(finalMap);
                    console.log(answerJSON);

                }
            });


        }

        */
        /*
        var inputDataArr = [ { jobid: '1', output: 23, toolid: "KEO302", timestamp: 1410159698562 },
            { jobid: '2', output: 32, toolid: "KEO302", timestamp: 1410159698662 },
            { jobid: '3', output: 10, toolid: "KEO302", timestamp: 1410159698762 },
            { jobid: '4', output: 23, toolid: "KEO302", timestamp: 1410159698862 },
            { jobid: '5', output: 43, toolid: "KEO302", timestamp: 1410159698962 },
            { jobid: '1', output: 21, toolid: "KEO301", timestamp: 1410159698562 },
            { jobid: '2', output: 23, toolid: "KEO301", timestamp: 1410159698662 },
            { jobid: '3', output: 15, toolid: "KEO301", timestamp: 1410159698762 },
            { jobid: '4', output: 22, toolid: "KEO301", timestamp: 1410159698862 },
            { jobid: '5', output: 114, toolid: "KEO301", timestamp: 1410159698962 }];


        var inputDataArr = [ { jobid: '1', output: 23, toolid: "KEO302", timestamp: 1410158998562 },
            { jobid: '2', output: 132, toolid: "KEO302", timestamp: 1410159098662 },
            { jobid: '3', output: 10, toolid: "KEO303", timestamp: 1410159198762 },
            { jobid: '4', output: 23, toolid: "KEO303", timestamp: 1410159298862 },
            { jobid: '5', output: 43, toolid: "KEO302", timestamp: 1410159398962 },
            { jobid: '1', output: 21, toolid: "KEO301", timestamp: 1410158998562 },
            { jobid: '2', output: 23, toolid: "KEO301", timestamp: 1410159098662 },
            { jobid: '3', output: 15, toolid: "KEO304", timestamp: 1410159198762 },
            { jobid: '4', output: 60, toolid: "KEO304", timestamp: 1410159298862 },
            { jobid: '5', output: 114, toolid: "KEO301", timestamp: 1410159398962 }];


        var chartType = 'line';

        switch(chartType){
            case 'bar':
                var sbc = StackedBarChart.StackedBarChart;

                sbc.convertToChartDataFormat(inputDataArr, function (additionalResJSON) {

                    for(var key in additionalResJSON){
                        resJSON[key] = additionalResJSON[key];
                    }
                    console.log("Data here");
                    console.log(resJSON);
                    //res.send(responseJSON);
                });
                break;

            case 'line':
                var lc = LineChart.LineChart;

                lc.convertToChartDataFormat(inputDataArr, function (additionalResJSON) {
                    for(var key in additionalResJSON){
                        resJSON[key] = additionalResJSON[key];
                    }
                    console.log(JSON.stringify(resJSON));
                    //res.send(resJSON);
                });
                break;

            case 'lamdemo':
                res.send(resJSON); //Dummy
                break;

        }*/
    });
};

// NEIL-memorize
exports.memorizeConfig = function (req, res) {

    var resJSON = {};
    var saveData = req.body.mainFlow;

    console.log("*-*-*-*-*-*-**-*--");
    console.log("---saveData--++++++");
    console.log(saveData);
    console.log("*-*-*-*-*-*-**-*--");

    res.send(saveData);

    //export that info in json
    fs.writeFile('./saved_flows/'+saveData["memoryFlows"][0]["filename"]+'.json', JSON.stringify(saveData), 'utf-8', function(err) {
       if (err) throw err
        console.log('memorized right data flows! Done!')
      });
}

exports.showMemorizeConfig = function (req, res) {
    var flowname = req.body.flowname;
    fs.readFile('./saved_flows/'+flowname+'.json', 'utf-8', function(err, content) {
      var fileData = JSON.parse(content);

      console.log("-----fileData++++");
      console.log(fileData);
      res.send(fileData);
      });
}

exports.deleteConfig = function (req, res) {
    var bunchName = req.body.bunchName;
    fs.unlinkSync('./saved_flows/'+bunchName+'.json');
    res.send(bunchName);
}
// NEIL-memorize



exports.getDashConfigAA = function (req, res) {
    var resJSON = {};
    var fileName = "AlarmAnalysis";     //The file name
    var dirname = process.env['HOME'] + '/.node-red/lib/flows/';
    fs.readFile(dirname + fileName, 'utf8', function (error, content) {


        // COPY CODE FROM THE FUNCTION ABOVE IF NEEDED.
        var fileData = JSON.parse(content);

        var currentDash = fileData.ORIGINAL_JSON;

        var flowGraph = graphlib.json.read(fileData.FLOW);
        var dashIndex = 0;

        /* FLOW PROCESSING */
        var flowGraphIDs = graphlib.alg.topsort(flowGraph);
        console.log(flowGraph.node(flowGraphIDs[0]).label.type);




        var chartType;
        var joinidColumn ;
        var groupidColumn ;
        var groupidVal ;
        console.log(req.body.dateRange);

        //var dateRange = '2017-05-11 00:00:00 / 2017-06-06 23:59:59';
        var startDate =new Date("2014-08-13 00:00:00");
        var endDate = new Date("2014-08-17 00:00:00");
        console.log(startDate);
        var datasourceJSON = {};


        for(var i=0;i<flowGraphIDs.length;i++)
        {

            if(flowGraph.node(flowGraphIDs[i]).label.type =='Start')
            {
                continue;
            }
            else if(flowGraph.node(flowGraphIDs[i]).label.type=='value')
            {
                datasourceJSON[flowGraph.node(flowGraphIDs[i]).label.name] = {"eventid" : flowGraph.node(flowGraphIDs[i]).label.start,
                                                                                "select":["data","eventid"],
                                                                                "variableType":"value",
                                                                                "table" : "events"};

            }
            else if(flowGraph.node(flowGraphIDs[i]).label.type=='Alarm Count')
            {

                 datasourceJSON[flowGraph.node(flowGraphIDs[i]).label.name] = { "select":["count(*)"],
                                                                                "variableType":"count",
                                                                                "table" : "alarm_log"};

            }
            else if(flowGraph.node(flowGraphIDs[i]).label.type=='ui_chart')
            {
                chartType = flowGraph.node(flowGraphIDs[i]).label.label;

            }
            else if(flowGraph.node(flowGraphIDs[i]).label.type=='Chart Precondition')
            {
                joinidColumn = flowGraph.node(flowGraphIDs[i]).label.joinID;
                groupidColumn = flowGraph.node(flowGraphIDs[i]).label.groupID;
                groupidVal = flowGraph.node(flowGraphIDs[i]).label.values;
            }
            else if(flowGraph.node(flowGraphIDs[i]).label.type=='')
            {

            }
        }



        var inputDataArr = [];
        var datasource ={};
        // Code for processing
        var keys = [];
        for(var key in datasourceJSON)
        {
            keys.push(key);
            datasourceJSON[key]["select"].push(joinidColumn);
        }

        var groupIDValsArr = groupidVal.split(',');
        var groupIDCount = new HashMap();
        console.log(groupIDValsArr);

        var paretoLine = {};
        var stackedBar = {};
        groupIDValsArr.forEach(function(groupID){
            groupIDCount.set(groupID,0); // To count what result came back
            datasource[groupID] = [];
            for(var i=0;i<keys.length;i++)
            {

                getValuesByDate(keys[i],endDate,startDate,groupID,datasourceJSON[keys[i]],groupidColumn,function(answerArray,key){
                    //datasource[groupID].push(answerArray);
                    //console.log(answerArray.length);
                    datasource[groupID][key]=answerArray;
                    //console.log(Object.keys(datasource[groupID]));
                    if(Object.keys(datasource[groupID]).length==keys.length)
                    {
                        //console.log(datasource[groupID]);
                        paretoLine[groupID] =[];
                        Object.keys(datasource[groupID][keys[0]]).forEach(function(post_date){

                            paretoLine[groupID].push({"xVal":post_date, //Date
                                "point":(1000*datasource[groupID]['ac'][post_date]/datasource[groupID]['wafer_count'][post_date])});
                                //point = mwba

                            if(!stackedBar[post_date])
                            {stackedBar[post_date] ={};}
                            stackedBar[post_date][groupID]=datasource[groupID]['ac'][post_date];

                            //if(paretoLine[groupID].length==Object.keys(datasource[groupID][keys[0]]).length)
                            if(Object.keys(paretoLine).length==groupIDValsArr.length &&
                                paretoLine[groupID].length==Object.keys(datasource[groupID][keys[0]]).length)
                            {
                                //console.log("reache here");
                                console.log(stackedBar);
                                var pc = ParetoChart.ParetoChart;

                                var inputDataArr = [];
                                inputDataArr.push(paretoLine);
                                inputDataArr.push(stackedBar);

                                pc.convertToChartDataFormat(inputDataArr, function (additionalResJSON) {

                                    for(var key in additionalResJSON){
                                        resJSON[key] = additionalResJSON[key];
                                    }
                                    console.log(JSON.stringify(resJSON));
                                    res.send(resJSON);
                                });
                            }
                        });
                    }
                });


            }
        });



        // //var chartType = resJSON.chartUIArr[0].chartType;
        // chartType = 'pareto';
        //
        // switch(chartType){
        //     case 'Pareto Chart':
        //         var pc = ParetoChart.ParetoChart;
        //
        //         pc.convertToChartDataFormat(inputDataArr, function (additionalResJSON) {
        //
        //             for(var key in additionalResJSON){
        //                 resJSON[key] = additionalResJSON[key];
        //             }
        //             console.log(JSON.stringify(resJSON));
        //             res.send(resJSON);
        //         });
        //         break;
        //
        //     case 'line':
        //         var lcaa = LineChartAA.LineChartAA;
        //
        //         lcaa.convertToChartDataFormat(inputDataArr, function (additionalResJSON) {
        //             for(var key in additionalResJSON){
        //                 resJSON[key] = additionalResJSON[key];
        //             }
        //             console.log(JSON.stringify(resJSON));
        //             res.send(resJSON);
        //         });
        //         break;
        // }
    });
};


function getValuesByDate(key, endDate, startDate, groupID,params,groupidColumn,callbackFunction)
{

    /*console.log("startDate"+startDate);
    console.log("endDate"+endDate);
    console.log("groupID"+groupID);
    console.log("key"+key)

*/
console.log("key"+key);
    //console.log(params);
    var dates = [];

    var lessThanDate = new Date(startDate);


    for(;lessThanDate<=endDate;)
    {
        dates.push(new Date(lessThanDate));
        lessThanDate.setDate(lessThanDate.getDate() + 1)
    }

    var answerJSON ={};

    if(params.variableType=="value")
    {

        for(var i=0;i<dates.length-1;i++)
        {

            var queryJSON = {"lessThanDate":dates[i+1],
                             "greaterThanDate":dates[i],
                            "toolid":groupID,
                            "selectColumn":"data, date",
                            "eventid":params.eventid};

            eventlogDB.getDataForTimeRange(queryJSON,function(callbackResult,error){
                var sum=0;
                //console.log(callbackResult.result.rows);
                if(!error)
                {
                    for(var k=0;k<callbackResult.result.rows.length;k++)
                    {

                        var splitData = callbackResult.result.rows[i].data.split("\t");
                        //console.log(splitData);
                        for(var j=0;j<splitData.length;j++)
                        {
                            if(splitData[j]=='PJProcessedWaferCount')
                            {
                                sum=sum+parseInt(splitData[j+3]);
                                //console.log(sum);
                                if(k==callbackResult.result.rows.length-1)
                                {
                                    //answerJSON.push({"date":callbackResult.date,"waferCount":sum,"toolid":callbackResult.groupID});
                                    //console.log(answerJSON);

                                    answerJSON[callbackResult.date] = sum;
                                    //if(answerJSON.length==dates.length-1)
                                    if(Object.keys(answerJSON).length==dates.length-1)
                                    {
                                        //console.log("reached"+answerJSON);
                                        callbackFunction(answerJSON,key);
                                    }
                                }
                            }
                        }

                    }
                    if(!(callbackResult.result.rows.length>0))
                    {
                        //answerJSON.push({"date":callbackResult.date,"waferCount":0,"toolid":callbackResult.groupID});
                        //console.log(answerJSON);
                        answerJSON[callbackResult.date] = 0;
                        //if(answerJSON.length==dates.length-1)
                        if(Object.keys(answerJSON).length==dates.length-1)
                        {
                            //console.log("reached"+answerJSON);
                            callbackFunction(answerJSON,key);
                        }
                    }
                }
                else
                {
                    //answerJSON.push({"date":queryJSON.greaterThanDate,"waferCount":0});
                    //callbackFunction(answerJSON);
                }



            });
        }
    }
    else if(params.variableType=="count")
    {
        for(var i=0;i<dates.length-1;i++)
        {

            var queryJSON = {"lessThanDate":dates[i+1],
                             "greaterThanDate":dates[i],
                            "toolid":groupID,
                            "selectColumn":"count (*)",
                            "eventid":params.eventid};

            alarmlogDB.getDataForTimeRange(queryJSON,function(callbackResult,error){
                if(callbackResult.result.rows.length>0)
                {
                    //console.log(callbackResult.result.rows[0].c.toString());
                    //answerJSON.push({"date":callbackResult.date,"alarmCount":callbackResult.result.rows[0].c.toString(),"toolid":callbackResult.groupID});
                    answerJSON[callbackResult.date] = callbackResult.result.rows[0].c.toString();
                }
                else
                {
                    //answerJSON.push({"date":callbackResult.date,"alarmCount":0,"toolid":callbackResult.groupID});
                    answerJSON[callbackResult.date] = '0';
                }


                //if(answerJSON.length==dates.length-1)
                if(Object.keys(answerJSON).length==dates.length-1)
                {
                    //console.log("reached"+answerJSON);
                    callbackFunction(answerJSON,key);
                }
            });

        }
    }
    //console.log(dates);

}


//-----------------dummy----------------------------
exports.getLineChartDataAA = function(req, res){
    var lcaa = LineChartAA.LineChartAA;
    var inputDataArr = [];
    var resJSON = {};
    lcaa.convertToChartDataFormat(inputDataArr, function (additionalResJSON) {
                 for(var key in additionalResJSON){
                        resJSON[key] = additionalResJSON[key];
                   }
               res.send(resJSON);
             });
}
