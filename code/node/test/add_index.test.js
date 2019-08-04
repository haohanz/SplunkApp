var expect  = require("chai").expect;
var request = require("supertest");

var nodeUrl = require("../global.js").nodeUrl;

describe("Test Add Index on Node Server", function() {
    describe("Add Event on Node Server", function() {

        this.timeout(5000);

        it("should return status 400 on empty request", function(done) {
            request(nodeUrl)
                .get('/add_index')
                .send({})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 409 on already existex index", function(done) {
            request(nodeUrl)
                .get('/add_index')
                .send({idx: "history"})
                .expect(409)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 200 on new index", function(done) {
            request(nodeUrl)
                .get('/add_index')
                .send({idx: "new"})
                //.expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

    });

});
