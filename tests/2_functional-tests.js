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
var os = require('os');

const MongoClient = require('mongodb');
const MONGODB_CONNECTION_STRING = process.env.DB;

const ip = '::ffff:' + os.networkInterfaces().lo[0].address;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suiteSetup('Setup for Functional Tests', function(done) {
    try { 
      MongoClient.connect(MONGODB_CONNECTION_STRING, async (err, db) => {
        const collection = db.collection("stocks");
        // set two boogus likes for GOOG. 
        let updateDoc = {stockSym: 'GOOG', IP: 0} 
        collection.update(updateDoc, updateDoc, {upsert: true})
        updateDoc = {stockSym: 'GOOG', IP: 1} 
        collection.update(updateDoc, updateDoc, {upsert: true})
        // remove like for current ip for both GOOG and MSFT
        let removeDoc = {stockSym: 'GOOG', IP: ip} 
        collection.remove(removeDoc); 
        removeDoc = {stockSym: 'MSFT', IP: ip} 
        collection.remove(removeDoc); 
        done();
      });
    } catch (err) { 
      throw err
    }
    
  })

  suite('GET /api/stock-prices => stockData object', function() {
    let likeCount = 0;
    test('1 stock', function(done) {
     chai.request(server)
      .get('/api/stock-prices')
      .query({stock: 'goog', like:false})
      .end(function(err, res){
        // console.log('body: ' + JSON.stringify(res.body));
        console.log('err: ' + JSON.stringify(err));
        assert.equal(res.status, 200); 
        assert.property(res.body.stockData, 'stock');
        assert.property(res.body.stockData, 'price');
        assert.property(res.body.stockData, 'likes');
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.notEqual(res.body.stockData.price, '0000.0000', 'stubStockAPI is enabled');
        assert.equal(res.body.stockData.likes, 2);
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
        assert.notEqual(res.body.stockData.price, '0000.0000', 'stubStockAPI is enabled');
          assert.equal(res.body.stockData.likes, likeCount + 1);
          done(); 
      });
    });
      
    test('1 stock with like again (ensure likes are not double counted)', function(done) {
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
        assert.notEqual(res.body.stockData.price, '0000.0000', 'stubStockAPI is enabled');
          assert.equal(res.body.stockData.likes, likeCount + 1);
          done(); 
      });
    });
      
    test('2 stocks', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ["goog", "msft"], like: false }) 
        .end(function(err, res){
          // console.log('res.body: ' + JSON.stringify(res.body));  
          console.log('res.text: ' + JSON.stringify(res.text));  
          console.log('err: ' + JSON.stringify(err));  
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.property(res.body.stockData[0], "price");
          assert.property(res.body.stockData[0], "rel_likes");
          assert.equal(res.body.stockData[0].rel_likes, 3);
        assert.notEqual(res.body.stockData.price, '0000.0000', 'stubStockAPI is enabled');
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.property(res.body.stockData[1], "price"); 
          assert.property(res.body.stockData[1], "rel_likes"); 
          assert.equal(res.body.stockData[1].rel_likes, -3);
        assert.notEqual(res.body.stockData.price, '0000.0000', 'stubStockAPI is enabled');
          done();
      });
    });
      
    test('2 stocks with like', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ["goog", "msft"], like: true }) 
        .end(function(err, res){
          console.log('res.body: ' + JSON.stringify(res.body));  
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, "GOOG");
          assert.property(res.body.stockData[0], "price");
          assert.property(res.body.stockData[0], "rel_likes");
        assert.notEqual(res.body.stockData.price, '0000.0000', 'stubStockAPI is enabled');
          assert.equal(res.body.stockData[0].rel_likes, 2);
          assert.equal(res.body.stockData[1].stock, "MSFT");
          assert.property(res.body.stockData[1], "price"); 
          assert.property(res.body.stockData[1], "rel_likes"); 
          assert.equal(res.body.stockData[1].rel_likes, -2);
        assert.notEqual(res.body.stockData.price, '0000.0000', 'stubStockAPI is enabled');
          done();
      });
    });
  });
  
  suiteTeardown('Teardown after Functional Tests', function() {
    try { 
      MongoClient.connect(MONGODB_CONNECTION_STRING, async (err, db) => {
        if (err) throw err
        const collection = db.collection("stocks");
        // remove test likes for GOOG. 
        let removeDoc = {stockSym: 'GOOG', IP: 0} 
        collection.remove(removeDoc); 
        removeDoc = {stockSym: 'GOOG', IP: 1} 
        collection.remove(removeDoc); 
        removeDoc = {stockSym: 'GOOG', IP: ip} 
        collection.remove(removeDoc); 
        removeDoc = {stockSym: 'MSFT', IP: ip} 
        collection.remove(removeDoc); 
      });
    } catch (err) { 
      throw err
    }
  });

});
