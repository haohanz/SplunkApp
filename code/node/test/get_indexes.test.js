var expect  = require("chai").expect;
var request = require("supertest");

var app = require("../app.js");
var globals = require("../global.js");

describe("Test post Index on Node Server", function() {
    describe("post Event on Node Server", function() {

        this.timeout(5000);

        it("should return status 200 on empty request", function(done) {
            request(app)
                .get('/get_indexes')
                .send({})
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return array in text", function(done) {
            request(app)
                .get('/get_indexes')
                .send({})
                .expect(200)
                .end(function(err, res) {
                  console.log(res.text);
                    expect(typeof(res.text)).to.equal("string");
                    expect(JSON.parse(res.text)).to.be.an('array');
                    if (err) return done(err);
                    done();
                });
        });

        it("should include internal indexes", function(done) {
            request(app)
                .get('/get_indexes')
                .send({})
                .expect(200)
                .end(function(err, res) {
                    expect(JSON.parse(res.text)).to.be.an('array').that.include(globals.internal_idx);
                    expect(JSON.parse(res.text)).to.be.an('array').that.include(globals.history_idx);
                    expect(JSON.parse(res.text)).to.be.an('array').that.include(globals.audit_idx);
                    if (err) return done(err);
                    done();
                });
        });

        it("should include application indexes", function(done) {
            request(app)
                .get('/get_indexes')
                .send({})
                .expect(200)
                .end(function(err, res) {
                    expect(JSON.parse(res.text)).to.be.an('array').that.include(globals.hospital_idx);
                    expect(JSON.parse(res.text)).to.be.an('array').that.include(globals.nexpose_idx);
                    expect(JSON.parse(res.text)).to.be.an('array').that.include(globals.cve_idx);
                    expect(JSON.parse(res.text)).to.be.an('array').that.include(globals.cwe_idx);
                    if (err) return done(err);
                    done();
                });
        });
    });

});
