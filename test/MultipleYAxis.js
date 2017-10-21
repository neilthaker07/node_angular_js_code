/**
 * Created by gauravchodwadia on 5/2/17.
 */
var randomcolor = require('randomcolor');
var helperFunctions = require('../helperFunctions');
var _ = require("lodash");

exports.MultipleYAxis  = {

    convertToChartDataFormat : function ( inputDataArr, callback) {
        //console.log(inputDataArr);
        //var colorArray = randomcolor.randomColor({hue: 'random',luminosity: 'dark', count: inputDataArr["data"].length});

        //inputDataArr["data"].forEach(function(row,index){
        //    row["channelcolor"] = colorArray[index];
        //});
        //var additionalResJSON = inputDataArr["data"];
        var additionalResJSON = {};
        console.log("Reached here at MultipleYAxis converter");
        var lineTypes = [];

        var dataArray = [];
        _.each(inputDataArr,function(dateJSON,dateKey){

            _.each(dateJSON,function(value,key){

                //lineTypes.push(key);

                var tempJSON = {};
                tempJSON.val = value;
                tempJSON.timestamp = dateKey;
                //var group = tempJSON.waferId;

        //        console.log("--------in MultipleYAxis.js---datekey---key----value-----");
      //          console.log(dateKey+" *******"+key+"****"+value);
      //          console.log("--------in MultipleYAxis.js-------------");


                var dataObject = _.find(dataArray,{/*"channelname": key,*/"groupId": key});
                if(dataObject){
                    dataObject.values.push(tempJSON);
                }
                else{
                    var data = [];
                    data.push(tempJSON);
                    var outerJSON = {"values":data,"groupId": key,/*"channelname":key,*/"channelcolor":randomcolor.randomColor({luminosity: 'dark'})};
                    dataArray.push(outerJSON);
                }

            });
        });


		additionalResJSON = dataArray;
        callback(additionalResJSON);
    }

}
