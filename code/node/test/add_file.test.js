var expect  = require("chai").expect;
var request = require("supertest");

var app = require("../app.js");
var nexpose_idx = require("../global.js").nexpose_idx;

describe("Test Add File on Node Server", function() {
    describe("Add File on Node Server", function() {

        this.timeout(5000);

        it("should return status 400 on empty request", function(done) {
            request(app)
                .post('/add_file')
                .send({})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 400 on request without index", function(done) {
            request(app)
                .post('/add_file')
                .send({evts: [1, 2, 3], fields: "1,2,3"})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 400 on request without fields", function(done) {
            request(app)
                .post('/add_file')
                .send({evts: [1, 2, 3], idx: "history"})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 400 on request without events", function(done) {
            request(app)
                .post('/add_file')
                .send({fields: "field1,field2,field3", idx: "history"})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 200 on string field events", function(done) {
            request(app)
                .post('/add_file')
                .send({evts: 'test event', fields: "1,2,3", idx: "history"})
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 400 on empty list events", function(done) {
            request(app)
                .post('/add_file')
                .send({evts: [], fields: "1,2,3", idx: "history"})
                .expect(400)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 200 on single field events", function(done) {
            request(app)
                .post('/add_file')
                .send(JSON.stringify({evts: [1,2,3], fields: "single field", idx: "history"}))
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should work when uploading to nexpose index with new cve", function(done) {
            request(app)
                .post('/add_file')
                .send(JSON.stringify({evts: ['cve-2018-00000'], fields: "cve", idx: nexpose_idx}))
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should skip when uploading to nexpose index with invalid cve", function(done) {
            request(app)
                .post('/add_file')
                .send(JSON.stringify({evts: ['cve-0000'], fields: "cve", idx: nexpose_idx}))
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should work and push to splunk when uploading to nexpose with new cve", function(done) {
            request(app)
                .post('/add_file')
                .send(JSON.stringify({evts: ['CVE-2015-3429'], fields: "cve", idx: nexpose_idx}))
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should work and push to splunk when uploading to nexpose with old cve", function(done) {
            request(app)
                .post('/add_file')
                .send(JSON.stringify({evts: ['CVE-2018-15890'], fields: "cve", idx: nexpose_idx}))
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

    });

});
