var expect  = require("chai").expect;
var request = require("supertest");

var url = require("../global.js").url;
var nodeUrl = require("../global.js").nodeUrl;

describe("Test Basic Routing Status", function() {

    //describe("Basic Routing Status on Splunk Server", function() {

    //    it("should return status 200 on port 8000", function() {
    //        request(url, function(error, response, body) {
    //            expect(response.statusCode).to.equal(200);
    //        });
    //    });
    //});

    //describe("Basic Routing Status on Node Server", function() {
    //    it("should return status 200 on port 4000", function() {
    //        request(nodeUrl, function(error, response, body) {
    //            expect(response.statusCode).to.equal(200);
    //        });
    //    });
    //});

});
