/**
 * Created by vineeth on 03/01/18.
 */

var assert = require('chai').assert,
    superagent = require('superagent'),
    app = require('../server/server');

describe('Person model', function() {
    var server;

    beforeEach(function(done) {
        server = app.listen(done);
    });

    afterEach(function(done) {
        server.close(done);
    });


    it('should successfully register to application', function(done) {
        superagent
            .post('http://localhost:3000/api/AppUsers')
            .send({name: "vineeth", city: "Kochi", country: "India", contact: {},username: "username",
                password: "123456", email: "vineeth8@intivev.com"})
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end(function(err, loginRes) {
                setTimeout(done, 300);

                assert.equal(loginRes.status, 200);
                assert.ok(loginRes.body);
                assert.equal(loginRes.body.username, 'username');
            });
    });

    it('should successfully login to application', function(done) {
        superagent
            .post('http://localhost:3000/api/AppUsers/login')
            .send({ email: 'vineeth3@intivev.com', password: '123456' })
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end(function(err, loginRes) {
                setTimeout(done, 300);

                assert.equal(loginRes.status, 200);
                assert.ok(loginRes.body);
                assert.equal(loginRes.body.userId, '5a4d15ef1dcfe526eca2b34c');
            });
    });
});
