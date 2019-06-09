/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http'); 
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

const MongoClient = require('mongodb');
const MONGODB_CONNECTION_STRING = process.env.DB;

chai.use(chaiHttp);

suite('Functional Tests', function() {
    MongoClient.connect(MONGODB_CONNECTION_STRING, async (err, db) => {
      if (err) throw err
      const collection = db.collection("stocks");
      // set two boogus likes for GOOG. 
      let updateDoc = {stockSym: 'GOOG', IP: 0} 
      collection.update(updateDoc, updateDoc, {upsert: true})
      updateDoc = {stockSym: 'GOOG', IP: 1} 
      collection.update(updateDoc, updateDoc, {upsert: true})
    });
    suite('GET /api/stock-prices => stockData object', function() {
      let likeCount = 0;
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          // console.log('body: ' + JSON.stringify(res.body));
          assert.equal(res.status, 200); 
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isAtLeast(res.body.stockData.likes, 2);
          likeCount = res.body.stockData.likes;
          done(); 
        });
      });
      
      test('1 stock with like', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'GOOG', like:true}) 
        .end(function(err, res){
          // console.log('body: ' + JSON.stringify(res.body));
          assert.equal(res.status, 200);
          assert.property(res.body.stockData, 'stock');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.likes, likeCount+1);
          done(); 
        });
      });
      
//       test('1 stock with like again (ensure likes arent double counted)', function(done) {
//           done();
//       });
      
//       test('2 stocks', function(done) {
//           done();
//       });
      
//       test('2 stocks with like', function(done) {
//           done();
//       });
      
    });

});
