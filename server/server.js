const express = require('express');
const app = express();
const fetch = require('node-fetch');
const port = 9090;
const api_key = '52f8f9af79e0664f928042deb0e2b888';
const bodyParser = require('body-parser');
const helmet = require('helmet');

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://mongodb_user:123654@cluster0.14oq0.mongodb.net/<Cluster0>?retryWrites=true&w=majority';
MongoClient.connect(uri, (err, database) => {
    global.DB = database.db();
})

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    res.setHeader('Accept-Charset', 'utf-8')
    next();
});

app.get('/city', (req, res) => {
    let city = req.query.q;
    city = encodeURI(city);
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=metric' + '&appid=' + api_key;
    fetch(url).then(function (resp) {
        if (resp.status === 200) {
            return resp.json()
        } else {
            return 404
        }
    }).then(function (data) {
        res.send(data)
    })
})

app.get('/coordinates', (req, res) => {
    let lat = req.query.lat;
    let lon = req.query.lon;
    fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&units=metric' + '&appid=' + api_key)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {
            res.send(data)
        })
})

app.get('/cities', (req, res) => {

    let db = global.DB;
    db.collection('cities').find({}).toArray()
        .then(res => res.map((city) => city.name))
        .then((result) => {
            res.send({cities: result});
        })
        .catch((err) => {
                res.sendStatus(503);
            });
})

app.post('/cities', (req, res) => {
    let city_name = req.body.name;
    let textType = typeof city_name;

    res.setHeader('Content-Type', `text/${textType}; charset=UTF-8`)
    //res.sendStatus(200);
    //let query = "INSERT INTO cities (city) VALUES ('"+ city_name + "')";
    /*client.query(query)
        .then(() => {
            res.sendStatus(200);
        })
        .catch(err => {
            res.sendStatus(400);
        });*/
    let db = global.DB;
    db.collection('cities').find({name: city_name}).toArray().then((result) => {
        if (!result.length) {
            db.collection('cities').insertOne({name: city_name});
            res.sendStatus(200);
        } else {
        res.sendStatus(400);
}
});
})

app.delete('/cities', (req, res) => {
    let city_name = req.body.name;
    let db = global.DB;

    //let query = 'DELETE FROM cities WHERE city=\'' + city_name + '\'';

    /*client
        .query(query)
        .then(result => {
            res.sendStatus(200);
        })
        .catch(err => {
            res.sendStatus(400);
            throw err;
        });*/

    db.collection('cities').deleteOne({name: city_name}).then( (err, item) => {
        if (err) {
            return res.sendStatus(400);
        } else {
            return res.sendStatus(200)
        }
    });
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})

module.exports = app;