/**
 * Created by gauravchodwadia on 5/2/17.
 */
var randomcolor = require('randomcolor');
var helperFunctions = require('../helperFunctions');
var _ = require("lodash");

exports.LineChart  = {

    convertToChartDataFormat : function ( inputDataArr, callback) {

        var additionalResJSON = {};
        console.log("Reached here at line converter");
        var lineTypes = [];
    /*
        var uniqueGroups = helperFunctions.uniqueValuesOfKeyInJSON('toolid', inputDataArr);   //Unique Groups for stacked bar chart e.g.ToolIDs
        var colorArr = randomcolor.randomColor({count: uniqueGroups.length, hue: 'random'});
        var colorIndex = 0;

        var tempResJSON = inputDataArr.reduce(function (groupsJSON, inputData) {
            if(groupsJSON) {
                var pointJSON = {};
                pointJSON.value = inputData.output;
                pointJSON.xVal = (new Date(inputData.timestamp)).toISOString();

                if (groupsJSON[inputData.toolid]) {

                    //if group is already present in the groupsJSON
                    groupsJSON[inputData.toolid].data.push(pointJSON);

                } else {
                    var groupJSON = {};

                    //key data
                    var groupDataArr = [];
                    groupDataArr.push(pointJSON); //first element of the data array
                    groupJSON.data = groupDataArr;

                    //key color
                    groupJSON.color = colorArr[colorIndex++];

                    //key groupid
                    groupJSON.groupId = inputData.toolid;

                    //add the group JSON to the groups JSON
                    groupsJSON[inputData.toolid] = groupJSON;
                }
            }
            return groupsJSON;
        }, {});


        var dataArray = [];
        for(var key in tempResJSON){
            dataArray.push(tempResJSON[key]);
        }

        */

        var dataArray = [];
        _.each(inputDataArr,function(dateJSON,dateKey){

            _.each(dateJSON,function(value,key){

                lineTypes.push(key);

                var tempJSON = {};
                tempJSON.value = parseInt(value);
                tempJSON.xVal = dateKey;

                console.log("--------in linechart.js---datekey---key-----value----");
                console.log(dateKey+" *******"+key+"*************"+value);
                console.log("--------in linechart.js-------------");

                var dataObject = _.find(dataArray,{"groupId": key});
                if(dataObject){
                    dataObject.data.push(tempJSON);
                }
                else{
                    var data = [];
                    data.push(tempJSON);
                    var outerJSON = {"data":data,"groupId":key,"color":randomcolor.randomColor({luminosity: 'dark'})};
                    dataArray.push(outerJSON);
                }

            });
        });

        //console.log("response data here   "+JSON.stringify(dataArray));
        additionalResJSON.lineTypes = Array.from(new Set(lineTypes));

        //additionalResJSON.lineTypes = uniqueGroups;
        additionalResJSON.dataArray = dataArray;
        callback(additionalResJSON);

    }

}
