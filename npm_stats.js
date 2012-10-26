module.exports = function() {
  var datable = require('date-utils');
  var sorted = require('sorted');

  var self = this;
  var registry = new (require('cushion').Connection)('isaacs.iriscouch.com');

  this.registry_data = {};
  this.sorted_by_date = [];

  this.queryDatabase = function() {
    console.log('Querying Information: please wait one moment');
    registry.request({
      'method': 'GET',
      'path': 'registry/_all_docs?include_docs=true',
      'callback': function(error, response, headers) {
        if(error) {
          console.log(error);
        }
        else{
          self.registry_data = monthHash(response);
        }
      }
    });
  };

  this._sortRegistryHash = function() {
    var modulesByDate = [];
    Object.keys(this.registry_data).forEach(function(module) {
       modulesByDate.push(this.registry_data[module]);
    });
     self.sorted_by_date = sorted(modulesByDate, compareDate);
  };

  this.calculateGrowthPerMonth = function() {
    var calculation = {};
    var total = 0;
    _sortRegistryHash();
    sorted_by_date.forEach(function(date) {
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

  queryDatabase();
  return this;
};

function monthHash(response) {
  var registry_data = {};
  response.rows.forEach( function(row) {
    if(row.doc !== undefined) {
      if(row.doc.time === undefined) {
        if(row.doc.ctime !== undefined){
          registry_data[row.doc.name] = new Date(row.doc.ctime.replace(/T.*/, ''));
        }
        else {
          console.log(row.doc.name);
        }
      }
      else {
        registry_data[row.doc.name] = new Date(row.doc.time.created.replace(/T.*/, ''));
      }
    }
  });
  console.log('finished dumping data');
  return registry_data;
}

function compareDate (a, b) {
  return a.compareTo(b);
}