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

describe('server post', () => {
    it('Add new city 200', (done) => {
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.find
            .withArgs({name: 'Cherepovets'})
            .returns(sinon.mongo.documentArray([]));
        mockCollection.insertOne
            .withArgs({name: 'Cherepovets'})
            .resolves(true);
        chai.request(server)
            .post('/cities')
            .send({name: 'Cherepovets'})
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.find);
                sinon.assert.calledOnce(mockCollection.insertOne);
                done();
            });
    });

    it('Add empty city', (done) => {
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.find
            .withArgs({name: ''})
            .returns(sinon.mongo.documentArray([]));
        mockCollection.insertOne
            .withArgs({name: ''})
            .resolves(true);
        chai.request(server)
            .post('/cities')
            .send({name: ''})
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.find);
                done();
            });
    });


    it('Add city two times', (done) => {
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

    it('Server error 503', (done) => {
        let mockCollection = sinon.mongo.collection();
        mockCollection
            .find
            .withArgs({})
            .returns(sinon.mongo.documentArray([null]));

        global.DB = sinon.mongo.db({
            cities: mockCollection
        });

        chai.request(server)
            .get('/cities')
            .end((err, res) => {
                res.should.have.status(503);
                sinon.assert.calledOnce(mockCollection.find);
                done();
            });
    });

    it('Delete city 200', (done) => {
        let mockCollection = sinon.mongo.collection();
        mockCollection.deleteOne
            .withArgs({name: 'Cherepovets'})
            .resolves();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        chai.request(server)
            .delete('/cities')
            .send({name: 'Cherepovets'})
            .end((err, res) => {
                res.should.have.status(200);
                sinon.assert.calledOnce(mockCollection.deleteOne);
                done();
            });
    });

    it('Delete city 500', (done) => {
        let mockCollection = sinon.mongo.collection();
        mockCollection.deleteOne
            .withArgs({name: 'Cherepovets'})
            .resolves();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        chai.request(server)
            .delete('/cities')
            .send({name: 'Mu'})
            .end((err, res) => {
                res.should.have.status(500);
                sinon.assert.calledOnce(mockCollection.deleteOne);
                done();
            });
    });

    it('Get cities 200', (done) => {
        const docArray = [{name: 'Cherepovets'}, {name: 'Moscow'}];
        let mockCollection = sinon.mongo.collection();
        global.DB = sinon.mongo.db({
            cities: mockCollection
        });
        mockCollection.find
            .withArgs({})
            .returns(sinon.mongo.documentArray(docArray));

        const resultArray = ['Cherepovets', 'Moscow'];
        chai.request(server)
            .get('/cities')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.should.have.own.property('cities');
                res.body.cities.should.be.eql(resultArray);
                sinon.assert.calledOnce(mockCollection.find);
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