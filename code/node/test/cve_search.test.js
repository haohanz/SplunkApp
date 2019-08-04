var expect  = require("chai").expect;
var request = require("supertest");

var nodeUrl = require("../global.js").nodeUrl;

describe("Test CVE Search on Node Server", function() {
    describe("CVE Search on Node Server", function() {

        var cve = "cve-2018-15890";
        this.timeout(5000);

        it("should return status 200 on empty request", function(done) {
            request(nodeUrl)
                .get('/cve_search')
                .send({})
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should be case insensitive", function(done) {
            request(nodeUrl)
                .get('/cve_search')
                .send({"cve": cve.toUpperCase()})
                .end(function(err, res) {
                    if (err) return done(err);
                    done();
                });
        });

        it("should return empty cwe only with none existing new cve", function(done) {
            var cve = "cve-2019-07256";
            request(nodeUrl)
                .get('/cve_search')
                .send({"cve": cve.toUpperCase()})
                .expect('Content-Type', /json/)
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).to.have.property("cwe");
                    //expect(res.body.cwe).to.be.equal("");
                    done();
                });
        });

        it("should return cve and cwe with new valid cve", function(done) {
            var cve = "cve-2017-5662";
            request(nodeUrl)
                .get('/cve_search')
                .send({"cve": cve.toUpperCase()})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    //expect(res.body).not.to.have.property("cve");
                    expect(res.body).to.have.property("cwe");
                    expect(res.body).to.have.property('vuln_description');
                    done();
                });
        });

        it("should return cve and cwe with matched cve", function(done) {
            var cve = "cve-2018-15890";
            request(nodeUrl)
                .get('/cve_search')
                .send({"cve": cve.toUpperCase()})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).to.have.property("cve");
                    expect(res.body).to.have.property("cwe");
                    expect(res.body).to.have.property('vuln_description');
                    done();
                });
        });

        it("should return correct cve and cwe with status 200", function(done) {
            var cve = "cve-2018-15890";
            request(nodeUrl)
                .get('/cve_search')
                .send({"cve": cve.toUpperCase()})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.cve.toUpperCase()).to.equal(cve.toUpperCase());
                    expect(res.body.cwe.toUpperCase()).to.equal("CWE-502");
                    expect(res.body.vuln_cvssv2_base_score).to.equal("10.0");
                    expect(res.body).to.have.property('vuln_description');
                    done();
                });
        });

        it("should return correct cve and cwe with status 200", function(done) {
            var cve = "cve-2018-15892";
            request(nodeUrl)
                .get('/cve_search')
                .send({"cve": cve.toUpperCase()})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.cve.toUpperCase()).to.equal(cve.toUpperCase());
                    expect(res.body.cwe.toUpperCase()).to.equal("CWE-89");
                    expect(res.body.vuln_cvssv3_base_score).to.equal("4.3");
                    expect(res.body).to.have.property('vuln_description');
                    done();
                });
        });

        it("should return status 404 when search non-existed cve", function(done) {
            var cve = "cve-9102";
            request(nodeUrl)
                .get('/cve_search')
                .send({"cve": cve.toUpperCase()})
                .expect('Content-Type', /json/)
                .expect(404)
                .end(function(err, res) {
                    expect(res.body).to.have.property('cwe');
                    expect(res.body.cwe).to.be.equal("");
                    expect(res.body).to.not.have.property('cve');
                    if (err) return done(err);
                    done();
                });
        });

        it("should return status 200 and save cve when search new cve", function(done) {
            var cve = "cve-2018-15893";
            request(nodeUrl)
                .get('/cve_search')
                .send({"cve": cve.toUpperCase()})
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    expect(res.body).to.have.property('cwe');
                    expect(res.body.cwe).to.be.equal("CWE-89");
                    expect(res.body).to.have.property('vuln_description');
                    if (err) return done(err);
                    done();
                });
        });
    });

});
