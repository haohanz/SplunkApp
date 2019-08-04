var expect  = require("chai").expect;
var request = require("supertest");

var nodeUrl = require("../global.js").nodeUrl;

describe("Test Add Event on Node Server", function() {
    describe("Add Event on Node Server", function() {

        this.timeout(5000);

        it("should return status 400 on empty request", function(done) {
            request(nodeUrl)
                .get('/add_event')
                .send({})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 400 on event without index", function(done) {
            request(nodeUrl)
                .get('/add_event')
                .send({evt: "bad request event"})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 400 on empty event", function(done) {
            request(nodeUrl)
                .get('/add_event')
                .send({idx: "test"})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 400 on non-existed index", function(done) {
            request(nodeUrl)
                .get('/add_event')
                .send({evt: "non-exist event", idx: "non-exist"})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 200 on adding string event to internal index", function(done) {
            request(nodeUrl)
                .get('/add_event')
                .send(JSON.stringify({evt: "test event history", idx: "history"}))
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 200 on adding json event to internal index", function(done) {
            request(nodeUrl)
                .get('/add_event')
                .send(JSON.stringify({evt: {test: "json"}, idx: "history"}))
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

    });

});
