const browserEnv = require('browser-env');
browserEnv(['navigator']);
const fetch = require('isomorphic-fetch');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const chai = require('chai');
const fetchMock = require('fetch-mock');
const JSDOM = require('jsdom').JSDOM;
const expect = require('chai').expect;
const baseURL = 'http://localhost:9090';
const should = chai.should();
const innerHTML = require('innerhtml');

html = `<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Weather</title>
      <link rel="stylesheet" href="css/main.css">
</head>

<body>
<header class="weather-top">
    <h1 class="weather-top-name">Weather here</h1>
    <form method="get" name="updateLocation">
        <button class="update-btn" type="button" name="updateLocation">Renew location</button>
        <button class="update-btn-img" type="button" name="updateLocation">
            <img src="images/location-update.png" class="update-img" alt="update"/>
        </button>
    </form>
</header>

<main class="main">
    <section class="main-city-info"></section>

    <section class="favorite">
        <div class="favorite-top">
            <h2>Favourites</h2>
            <div>
                <form method="get" name="addNewCity" class="add-new-city">
                    <input name="newCityName" class="new-city" type="text" placeholder="Добавить новый город">
                    <input type="submit" value="+" class="add-btn">
                </form>
            </div>
        </div>

        <ul class="favorite-cities"></ul>
    </section>
</main>

<template id="tempCurrentCityLoader">
    <div class="current-city-loader"></div>
</template>

<template id="tempFavoriteCityLoader">
    <li class="favorite-city">
        <div class="current-city-loader"></div>
    </li>
</template>

<template id="tempCurrentCity">
    <div class="main-city">
        <h2 class="main-city-name"></h2>
        <div class="main-weather">
            <img src="" class="current-weather-img" alt="weather"/>
            <p class="current-degrees"></p>
        </div>
    </div>
    <ul class="info">
        <li class="option">
            <span>Wind</span>
            <p></p>
        </li>
        <li class="option">
            <span>Cloudy</span>
            <p></p>
        </li>
        <li class="option">
            <span>Pressure</span>
            <p></p>
        </li>
        <li class="option">
            <span>Humidity</span>
            <p></p>
        </li>
        <li class="option">
            <span>Coordinates</span>
            <p></p>
        </li>
    </ul>
</template>

<template id="tempFavoriteCity">
    <li class="favorite-city">
        <div class="favorite-weather">
            <h3 class="favorite-city-name"></h3>
            <p class="degrees"></p>
            <img src="" class="favorite-weather-img" alt="weather small"/>
            <button onclick="" type="button" name="button" class="delete-btn">+</button>
        </div>

        <ul class="info">
            <li class="option">
                <span>Wind</span>
                <p></p>
            </li>
            <li class="option">
                <span>Cloudy</span>
                <p></p>
            </li>
            <li class="option">
                <span>Pressure</span>
                <p></p>
            </li>
            <li class="option">
                <span>Humidity</span>
                <p></p>
            </li>
            <li class="option">
                <span>Coordinates</span>
                <p></p>
            </li>
        </ul>
    </li>
</template>
</body>`

window = new JSDOM(html).window;
document = window.document;
let client = require('../../js/script');
global.window = window;
window.alert = sinon.spy();
global.document = window.document;
global.navigator = {
    userAgent: 'node.js'
};
global.fetch = fetch;
global.alert = window.alert;
global.FormData = window.FormData;


const spbResponse = {
    coord: {
        lon: 30.26,
        lat: 59.89
    },
    weather: [{
        id: 620,
        main: "Snow",
        description: "light shower snow",
        icon: "13n"
    }],
    base: "stations",
    main: {
        temp: -1,
        feels_like: -6.77,
        temp_min: -2,
        temp_max: -1.11,
        pressure: 1006,
        humidity: 92
    },
    visibility: 10000,
    wind: {
        speed: 4,
        deg: 160
    },
    snow: {
        "1h": 0.24
    },
    clouds: {
        all: 90
    },
    dt: 1608737704,
    sys: {
        type: 1,
        id: 8926,
        country: "RU",
        sunrise: 1608706856,
        sunset: 1608728118
    },
    timezone: 10800,
    id: 498817,
    name: "Saint Petersburg",
    cod: 200
};

const spbCurrent = `
    <div class="main-city">
        <h2 class="main-city-name">Saint Petersburg</h2>
        <div class="main-weather">
            <img src="images/weather/snow.png" class="current-weather-img" alt="weather">
            <p class="current-degrees">-1°C</p>
        </div>
    </div>
    <ul class="info">
        <li class="option">
            <span>Wind</span>
            <p>Breeze, 4 m/s, South</p>
        </li>
        <li class="option">
            <span>Cloudy</span>
            <p>Cloudy</p>
        </li>
        <li class="option">
            <span>Pressure</span>
            <p>1006 hpa</p>
        </li>
        <li class="option">
            <span>Humidity</span>
            <p>92 %</p>
        </li>
        <li class="option">
            <span>Coordinates</span>
            <p>[59.89, 30.26]</p>
        </li>
    </ul>
`


describe('test current city info', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('City by coordinates loader', (done) => {
        let lat = '59.89';
        let lon = '30.26';
        const url = baseURL + '/coordinates?lat=' + lat + ',lon=' + lon;
        fetchMock.once(url, spbResponse);
        client.fillCurrentCityInfo('coordinates', [`lat=${lat}`, `lon=${lon}`]).then((res) => {
            const currentCity = document.getElementsByClassName('main-city-info')[0];
            currentCity.innerHTML.should.be.eql(spbCurrent);
            done();
        }).catch(done);
    });

    it('City by name', (done) => {
        const cityName = 'Saint Petersburg'
        const url = baseURL + '/weather/city?q=' + cityName;
        fetchMock.once(url, spbResponse);
        client.fillCurrentCityInfo('city', ['q=Saint Petersburg']).then((res) => {
            const currentCity = document.getElementsByClassName('current-city-info')[0];
            currentCity.innerHTML.should.be.eql(spbCurrent);
            done();
        }).catch(done);
    });

    it('Server error alert test', (done) => {
        const cityName = 'Moscow';
        let url = baseURL + '/city?q=' + cityName;
        alert = sinon.spy();
        fetchMock.once(url, 503);
        client.request('city', ['q=' + cityName]).then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        }).catch(done);
    });

    it('City exists test', (done) => {
        const url = baseURL + '/city?q=Saint%20Petersburg';
        fetchMock.get(url, 500);
        let form = document.forms.namedItem('addNewCity');
        form.getElementsByTagName("input")[0].value = 'Saint Petersburg';
        alert = sinon.spy();
        client.addNewCity().then((res) => {
            expect(alert.called).to.be.true;
            done();
        }).catch(done);
    });

})
