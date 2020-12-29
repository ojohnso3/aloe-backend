// Import the dependencies for testing
let app = require('../app');
let chai = require('chai');
let chaiHttp = require('chai-http');
let admin = require('../firebase/admin');

// Configure chai
chai.use(chaiHttp);
chai.should();


describe("Admin", () => {
    let agent = chai.request.agent(app);
    before(() => {
        var agent = chai.request.agent(app)
        const getCookie = async () => {
            return await agent.post('/users/sessionLogin')
            .send({ idToken: "testing" })
            .then(function (res) {
                expect(res).to.have.cookie('sessionid');
                // The `agent` now has the sessionid cookie saved, and will send it
                // back to the server in the next request:
                describe("Get post by status", () => {
                    console.log(agent.jar.getCookies().toString())
                    it("responds with success", (done) => {
                        agent.get('/admin/posts')
                            .end((err, res) => {
                                res.should.have.status(401);
                                //res.body.should.be.a('array');
                                done();
                            });
                    });
                });
            });
        };
        agent = getCookie();
    });
    
    after(() => {
        agent.close();
    })

    describe("Get post by status", () => {
        console.log(agent.jar.getCookies().toString())
        it("responds with success", (done) => {
            agent.get('/admin/posts')
                .end((err, res) => {
                    res.should.have.status(401);
                    //res.body.should.be.a('array');
                    done();
                });
        });
    });
    // describe("Moderate post", () => {
    //     it("responds with success", (done) => {
    //         chai.request(app)
    //             .put('/admin/moderate')
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 done();
    //             });
    //     });
    // });
    // describe("Report post", () => {
    //     it("responds with success", (done) => {
    //         chai.request(app)
    //             .put('/admin/postreport')
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 done();
    //             });
    //     });
    // });
    // describe("Report comment", () => {
    //     it("responds with success", (done) => {
    //         chai.request(app)
    //             .put('/admin/commentreport')
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 done();
    //             });
    //     });
    // });
    // describe("Report user", () => {
    //     it("responds with success", (done) => {
    //         chai.request(app)
    //             .put('/admin/userreport')
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 done();
    //             });
    //     });
    // });
    // describe("Create prompt", () => {
    //     it("responds with success", (done) => {
    //         chai.request(app)
    //             .post('/admin/prompt')
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 done();
    //             });
    //     });
    // });
});