let updateLocationForm = document.forms.namedItem('updateLocation');
let addNewCityForm = document.forms.namedItem('addNewCity');

updateLocationForm.addEventListener('click', (event) => {
	getLocation();
	event.preventDefault();
})

addNewCityForm.addEventListener('submit', (event) => {
	addNewCity();
	event.preventDefault();
})

function request(endpoint, params) {
	const url = 'http://localhost:9090/';
	const request = url + endpoint + "?" + params;
	const abortController = new AbortController();
	const abortSignal = abortController.signal;
	return fetch(request, {signal: abortSignal}).then((response) => {
		if (response.ok) {
			return response.json();
		} else {
			alert('No place was found');
			return;
		}
	})
}

function addSavedCities() {
	const url = "http://localhost:9090/cities/";
	fetch(url).then ((response) => {
		if (response.ok) {
			return response.json();
		}
	}).then((response) => {
		console.log(response);
		for (let i = 0; i < response.cities.length; i++) {
			const newCity = newCityLoaderInfo();
			let city = response.cities[i];
			request('city', ['q=' + city]).then((jsonResult) => {
				addCity(jsonResult, newCity);
			});
		}
	})
}

function getLocation() {
	currentCityInfoLoader();
	let currentLocation = navigator.geolocation;
	if (currentLocation) {
		currentLocation.getCurrentPosition(
			(position) => {
				fillCurrentCityInfo("coordinates", [`lat=${position.coords.latitude}`, `lon=${position.coords.longitude}`]);
			},
			(error) => {
				fillCurrentCityInfo("city", ['q=Saint Petersburg']);
			}
		);
	} else {
		fillCurrentCityInfo("city", ['q=Saint Petersburg']);
	}
}

function currentCityInfoLoader() {
	const template = document.querySelector('#tempCurrentCityLoader');
	const imp = document.importNode(template.content, true);
	document.getElementsByClassName('main-city-info')[0].innerHTML = '';
	document.getElementsByClassName('main-city-info')[0].append(imp);
}

function fillCurrentCityInfo(endpoint, params) {
	return request(endpoint, params).then((jsonResult) => {
		const template = document.querySelector('#tempCurrentCity');
		const imp = document.importNode(template.content, true)
		imp.querySelector('.main-city-name').innerHTML = jsonResult.name;
		imp.querySelector('.current-weather-img').src = getWeatherIcon(jsonResult);
		imp.querySelector('.current-degrees').innerHTML = `${Math.floor(jsonResult.main.temp)}&deg;C`;
		fillWeatherInfo(jsonResult, imp);
		document.getElementsByClassName('main-city-info')[0].innerHTML = '';
		document.getElementsByClassName('main-city-info')[0].append(imp);
	});
}

function fillWeatherInfo(jsonResult, imp) {
	let p = imp.querySelectorAll('p');
	p[1].innerHTML = `${getTypeOfWind(jsonResult.wind.speed)}, ${jsonResult.wind.speed} m/s, ${getWindDirection(jsonResult.wind.deg)}`;
	p[2].innerHTML = `${getTypeOfCloudy(jsonResult.clouds.all)}`;
	p[3].innerHTML = `${jsonResult.main.pressure} hpa`;
	p[4].innerHTML = `${jsonResult.main.humidity} %`;
	p[5].innerHTML = `[${jsonResult.coord.lat}, ${jsonResult.coord.lon}]`;
}


function getTypeOfWind(wind) {
	if (wind >= 0 && wind < 15) {
		return 'Breeze';
	} else if (wind < 25) {
		return 'Wind';
	} else { return 'Strong wind';}
}

function getWindDirection(degrees) {
	if (degrees <= 57) {
		return 'NorthEast'
	} else if (degrees <= 100 ) {
		return 'East'
	} else if (degrees <= 140) {
		return 'SouthEast'
	} else if (degrees <= 200) {
		return 'South'
	} else if (degrees <= 220) {
		return 'SouthWest'
	} else if (degrees <= 280) {
		return 'West'
	} else if (degrees <= 320) {
		return 'NorthWest'
	} else return 'North'
}

function getTypeOfCloudy(percent) {
	if (percent < 12.5) {
		return 'Clear';
	} else return 'Cloudy';
}

function addNewCity() {
	const formData = new FormData(addNewCityForm);
	const cityName = formData.get('newCityName').toString();
	addNewCityForm.reset();
	const newCity = newCityLoaderInfo();
	return request('city', ['q=' + cityName]).then((jsonResult) => {
		const url = "http://localhost:9090/cities/";
		fetch(url, {
			method: 'POST',
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				name: jsonResult.name
			})
		}).then((response) =>{
			if (response.status === 200){
				addCity(jsonResult, newCity)
			} else {
				newCity.remove();
				alert("City exists");
			}
		})
	}).catch(err => {
		newCity.remove();
		alert('error')
	});
}

function newCityLoaderInfo() {
	let newCity = document.createElement('li');
	newCity.className = 'favorite-city';
	newCity.innerHTML = '<div class="current-city-loader"></div>';
	document.getElementsByClassName('favorite-cities')[0].appendChild(newCity);
	return newCity;
}

function addCity(jsonResult, newCity) {
	const cityName = jsonResult.name;
	newCity.id = cityName.split(' ').join('-');

	const template = document.querySelector('#tempFavoriteCity');
	const imp = document.importNode(template.content, true)
	imp.querySelector('.favorite-city-name').innerHTML = cityName;
	imp.querySelector('.degrees').innerHTML = `${Math.floor(jsonResult.main.temp)}&deg;C`;
	imp.querySelector('.favorite-weather-img').src = getWeatherIcon(jsonResult);
	imp.querySelector('.delete-btn')
		.addEventListener('click', () => deleteCity(cityName));
	fillWeatherInfo(jsonResult, imp);
	newCity.innerHTML = '';
	newCity.append(imp);
}

function deleteCity(cityName) {
	fetch("http://localhost:9090/cities", {
		method: 'DELETE',
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			name: cityName
		})
	}).then((response) => {
		if (response.status === 200){
			document.getElementById(cityName.split(' ').join('-')).remove();
		} else {
			alert("City wasn't deleted");
		}
	})
}

function getWeatherIcon(jsonResult) {
	let clouds = isCloudy(jsonResult.clouds.all);
	let wind = isWindy(jsonResult.wind.speed);
	let precipitation = isPrecipitation(jsonResult);
	let weather = '';

	if (clouds === 'yes' && precipitation === 'no' && wind === 'no') {
		weather = 'cloud';
	} else if (precipitation === 'no' && wind !== 'no') {
		weather = 'wind';
	} else if (precipitation === 'snow') {
		weather = 'snow';
	} else if (precipitation === 'rain') {
		weather = 'rain';
	} else weather = 'sun';
	return 'images/weather/' + weather + '.png';
}

function isCloudy(clouds) {
	if (clouds <= 30) {
		return 'no';
	} else return 'yes';
}

function isWindy(wind) {
	if (wind < 14) {
		return 'no';
	} else return 'yes';
}

function isPrecipitation(jsonResult) {
	let rain = 0;
	let snow = 0;
	if (jsonResult.hasOwnProperty('rain') && jsonResult.rain.hasOwnProperty('1h')) {
		rain = jsonResult.rain['1h'];
	}
	if (jsonResult.hasOwnProperty('snow') && jsonResult.snow.hasOwnProperty('1h')) {
		snow = jsonResult.snow['1h'];
	}
	if (snow > rain) {
			return 'snow';
	} else if (rain >= snow && rain !== 0) {
		return 'rain';
	}
	return 'no';
}

getLocation();
addSavedCities();

module.exports = {
	request : request,
	addSavedCities : addSavedCities,
	getLocation : getLocation,
	currentCityInfoLoader : currentCityInfoLoader,
	fillCurrentCityInfo : fillCurrentCityInfo,
	addNewCity : addNewCity,
	newCityLoaderInfo : newCityLoaderInfo,
	addCity : addCity
}