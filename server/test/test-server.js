const chai = require('chai');
const chai_http = require('chai-http');
const mocha = require('mocha');
const sinon = require('sinon');
require('sinon-mongo');
const afterEach = mocha.afterEach;
const beforeEach = mocha.beforeEach;
const fetchMock = require('fetch-mock');
const describe = mocha.describe;
const it = mocha.it;
chai.use(chai_http);
chai.should();
require('isomorphic-fetch');


const server = require('../server')
/*
describe('Server get city test', () => {
    it('status 200 get test', (done) => {
        chai.request(server)
            .post('/cities')
            .set('Content-Type', 'application/json').send({name: 'New-York'})
            .end((err, res) => {
                console.log(err);
                console.log(res);
                expect(res).to.have.status(200);
                done();
            });

    })
})*/

describe('server post', () => {
    it('ok add new city', (done) => {
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.find
            .withArgs({name: 'Murmansk'})
            .returns(sinon.mongo.documentArray([]));
        mockCollection.insertOne
            .withArgs({name: 'Murmansk'})
            .resolves(true);
        chai.request(server)
            .post('/cities')
            .send({name: 'Murmansk'})
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.find);
                sinon.assert.calledOnce(mockCollection.insertOne);
                done();
            });
    });

    it('error when add new city twice', (done) => {
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.find
            .withArgs({name: 'Murmansk'})
            .returns(sinon.mongo.documentArray([{name: 'Murmansk'}]));
        mockCollection.insertOne
            .withArgs({name: 'Murmansk'})
            .resolves();
        chai.request(server)
            .post('/cities')
            .send({name: 'Murmansk'})
            .end((err, res) => {
                res.should.have.status(400);
                sinon.assert.calledOnce(mockCollection.find);
                sinon.assert.notCalled(mockCollection.insertOne);
                done();
            });
    });

})


var assert = require('assert');
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});