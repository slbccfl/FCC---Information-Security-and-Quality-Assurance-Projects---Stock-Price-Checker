/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const getStockData = require('../middleware/getStockData');

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(getStockData, function (req, res, next){
      res.json(res.locals); 
  });
    
}; 