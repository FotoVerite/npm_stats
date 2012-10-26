var datable = require('date-utils');
var sorted = require('sorted');
var registry = new (require('cushion').Connection)('isaacs.iriscouch.com');

var npmStats = exports;

npmStats.registry_data = {};

npmStats.queryDatabase = function(callback) {
  if(Object.keys(npmStats.registry_data).length === 0) {
    console.log('Querying Information: please wait one moment');
    registry.request({
      'method': 'GET',
      'path': 'registry/_all_docs?include_docs=true',
      'callback': function(error, response, headers) {
        if(error) {
          console.log(error);
        }
        else{
          npmStats.registry_data = response;
          callback(response);
        }
      }
    });
  }
  else {
    callback(npmStats.registry_data);
  }
};

npmStats.getByMonth = function() {
  npmStats.queryDatabase(npmStats._growthByMonth);
};

npmStats._growthByMonth = function(data) {
  var response = npmStats._calculateGrowthPerMonth(
    npmStats._sortRegistryHash(
      npmStats._monthHash(data)
    )
  );
  npmStats.output = response;
  console.log(response);
};

npmStats._sortRegistryHash = function(data) {
  var modulesByDate = [];
  Object.keys(data).forEach(function(module) {
     modulesByDate.push(data[module]);
  });
   return sorted(modulesByDate, compareDate);
};

npmStats._calculateGrowthPerMonth = function(data) {
  var calculation = {};
  var total = 0;
  data.forEach(function(date) {
    var calcualtedDate = date.getMonthName() + "-" + date.getUTCFullYear();
    if(calculation[calcualtedDate] === undefined) {
      calculation[calcualtedDate] = (1 + total);
    }
    else {
      calculation[calcualtedDate] = calculation[calcualtedDate] + 1;
    }
    total = total + 1;
  });
  return calculation;
};

npmStats._monthHash = function(response) {
  var hash = {};
  response.rows.forEach( function(row) {
    if(row.doc !== undefined) {
      if(row.doc.time === undefined) {
        if(row.doc.ctime !== undefined){
          hash[row.doc.name] = new Date(row.doc.ctime.replace(/T.*/, ''));
        }
        else {
          console.log(row.doc.name);
        }
      }
      else {
        hash[row.doc.name] = new Date(row.doc.time.created.replace(/T.*/, ''));
      }
    }
  });
  return hash;
};

function compareDate (a, b) {
  return a.compareTo(b);
}