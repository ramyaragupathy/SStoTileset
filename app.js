var fs = require('fs');
var Promise = require('polyfill-promise');
var Sheets = require('google-sheets-api').Sheets;
var request = require('request');
var upload = require('mapbox-upload');
var geoJSON = {
  'type': 'FeatureCollection',
  'features': []
};

var locationJSON;

// Document id and Service account details
var documentId = '1dMrsgdD9mcnNj33rX6ikb9I9dqtKTDLrD7gU6TVvAkU';
var serviceEmail = 'test-931@sheets-app-1251.iam.gserviceaccount.com';
var serviceKey = fs.readFileSync('sheets.pem').toString();
//console.log(serviceEmail);
//console.log(serviceKey);

var sheets = new Sheets({ email: serviceEmail, key: serviceKey });
//console.log(sheets);

sheets.getSheets(documentId)
.then(function(sheetsInfo) {

var sheetInfo = sheetsInfo[0];


return Promise.all([
  sheets.getSheet(documentId, sheetInfo.id),
  sheets.getRange(documentId, sheetInfo.id)
  ]);
})
.then(function(sheets) {



var tableContent = sheets[1];

console.log(tableContent);

for (var i = 1 ; i<tableContent.length; i++) {

  var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + tableContent[i][0].content +
  ".json?access_token=pk.eyJ1IjoicmFteWFyYWd1cGF0aHkiLCJhIjoiOHRoa2JJTSJ9.6Y38XMOQL80LZyrUAjXgIg";
  
  constructJSON(url,tableContent,i);  

   
  

}





})
.catch(function(err){

// console.error(err, 'Failed to read Sheets document');
});

function constructJSON(url,data,index){
  request(url, function (error, response, body) {
  if (!error && response.statusCode == 200) {

    // console.log(url);
    locationJSON = JSON.parse(body);
    // console.log('geocode result', locationJSON);
    if (locationJSON.features.length) {
      var rowgeoJSON ={
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": locationJSON.features[0].geometry.coordinates
        },
        "properties": {
          "location": data[index][0].content,
          "gender":data[index][1].content,
          // "role": data[index][2].content,
        }
        
      }
    }
    // console.log(rowgeoJSON);

    geoJSON.features.push(rowgeoJSON);
    var json = JSON.stringify(geoJSON, null, 2);

    fs.writeFile('LocationData.geojson',json, function (err) {
    if (err) return console.log(err);

    });

    var progress = upload({
    file: 'LocationData.geojson', // Path to geojson file on disk.
    account: 'ramyaragupathy', // Mapbox user account.
    accesstoken: 'sk.eyJ1IjoicmFteWFyYWd1cGF0aHkiLCJhIjoiY2lseGprc2xkMDd6eHU5a3IycnR2NjJ5eSJ9.cR6yMycHqfj4glEYhhaxoA', // A valid Mapbox API secret token with the uploads:write scope enabled.
    mapid: 'ramyaragupathy.test' // The identifier of the map to create or update.
  });

  progress.on('error', function(err){
    if (err) throw err;
  });

  progress.on('progress', function(p){
    
  });

  progress.once('finished', function(){
   
  });
    // console.log(geoJSON);
    
  }
  })
  
}



