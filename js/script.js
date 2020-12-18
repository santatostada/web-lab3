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
	const url = 'http://localhost:9090/weather/';
	const request = url + endpoint + "?" + params;
	const abortController = new AbortController();
	const abortSignal = abortController.signal;
	return fetch(request, {signal: abortSignal}).then((response) => {
		if (response.ok) {
			return response.json();
		} else {
			alert('Cannot find this place');
		}
	}).catch(() => {
		alert('Connection was lost');
	});
}

function addSavedCities() {
	const url = "http://localhost:9090/favourites/";
	fetch(url).then ((response) => {
		if (response.ok) {
			return response.json();
		}
	}).then((response) => {
		console.log(response);
		for (let i = 0; i < response.cities.length; i++) {
			const newCity = newCityLoaderInfo();
			let key = response.cities[i];
			request('city', ['q=' + key]).then((jsonResult) => {
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
	request(endpoint, params).then((jsonResult) => {
		const template = document.querySelector('#tempCurrentCity');
		const imp = document.importNode(template.content, true)
		imp.querySelector('.main-city-name').innerHTML = jsonResult.name;
		imp.querySelector('.current-weather-img').src = `images/weather/${getWeatherIcon(jsonResult)}.png`;
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
	if (wind >= 0 && wind < 6) {
		return 'Light breeze';
	} else if (wind >= 6 && wind < 15) {
		return 'Moderate breeze';
	} else if (wind >= 15 && wind < 25) {
		return 'Windy';
	} else if (wind >= 25 && wind < 33) {
		return 'Very windy';
	} else if (wind >= 33) {
		return 'Strong wind';
	}
}

function getWindDirection(deg) {
	if (deg > 11.25 && deg <= 33.75) {
		return 'North-Northeast'
	}
	if (deg > 33.75 && deg <= 56.25) {
		return 'Northeast'
	}
	if (deg > 56.25 && deg <= 78.75) {
		return 'East-Northeast'
	}
	if (deg > 78.75 && deg <= 101.25) {
		return 'East'
	}
	if (deg > 101.25 && deg <= 123.75) {
		return 'East-Southeast'
	}
	if (deg > 123.75 && deg <= 146.25) {
		return 'Southeast'
	}
	if (deg > 146.25 && deg <= 168.75) {
		return 'South-Southeast'
	}
	if (deg > 168.75 && deg <= 191.25) {
		return 'South'
	}
	if (deg > 191.25 && deg <= 213.75) {
		return 'South-Southwest'
	}
	if (deg > 213.75 && deg <= 236.25) {
		return 'Southwest'
	}
	if (deg > 236.25 && deg <= 258.75) {
		return 'West-Southwest'
	}
	if (deg > 258.75 && deg <= 281.25) {
		return 'West'
	}
	if (deg > 281.25 && deg <= 303.75) {
		return 'West-Northwest'
	}
	if (deg > 303.75 && deg <= 326.25) {
		return 'Northwest'
	}
	if (deg > 326.25 && deg <= 346.75) {
		return 'North-Northwest'
	}
	return 'North'
}

function getTypeOfCloudy(percent) {
	if (percent < 12.5) {
		return 'Clear';
	} else if (percent >= 12.5 && percent < 37.5) {
		return 'Mostly clear';
	} else if (percent >= 37.5 && percent < 62.5) {
		return 'Partly cloudy';
	} else if (percent >= 62.5 && percent < 87.5) {
		return 'Mostly cloudy';
	} else if (percent >= 87.5) {
		return 'Cloudy';
	}
}

function addNewCity() {
	const formData = new FormData(addNewCityForm);
	const cityName = formData.get('newCityName').toString();
	addNewCityForm.reset();
	const newCity = newCityLoaderInfo();
	request('city', ['q=' + cityName]).then((jsonResult) => {
		const url = "http://localhost:9090/favourites/";
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
	imp.querySelector('.favorite-weather-img').src = `images/weather/${getWeatherIcon(jsonResult)}.png`;
	imp.querySelector('.delete-btn')
		.addEventListener('click', () => deleteCity(cityName));
	fillWeatherInfo(jsonResult, imp);
	newCity.innerHTML = '';
	newCity.append(imp);
}

function deleteCity(cityName) {
	fetch("http://localhost:9090/favourites", {
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
	let clouds = haveClouds(jsonResult.clouds.all);
	let wind = haveWind(jsonResult.wind.speed);
	let precipitation = havePrecipitation(jsonResult);
	let timeOfDay = getTimeOfDay(jsonResult);

	if (clouds === 'cloudy' && precipitation === 'no' && wind === 'no') {
		return 'cloud';
	} else if (clouds === 'variable' && precipitation === 'no' && wind === 'no' && timeOfDay === 'day') {
		return 'variable-cloudy-day';
	} else if (clouds === 'variable' && precipitation === 'no' && wind === 'no' && timeOfDay === 'night') {
		return 'variable-cloudy-night';
	} else if (clouds === 'cloudy' && precipitation === 'no' && wind !== 'no') {
		return 'wind';
	} else if (clouds === 'variable' && precipitation === 'no' && wind !== 'no' && timeOfDay === 'day') {
		return 'wind-day';
	} else if (clouds === 'variable' && precipitation === 'no' && wind !== 'no' && timeOfDay === 'night') {
		return 'wind-night';
	} else if (clouds === 'cloudy' && (precipitation === 'rain' || precipitation === 'downpour') && wind === 'tempest') {
		return 'tempest';
	} else if (clouds === 'cloudy' && (precipitation === 'rain' || precipitation === 'downpour') && wind === 'tempest' && timeOfDay === 'day') {
		return 'tempest-day';
	} else if (clouds === 'cloudy' && (precipitation === 'rain' || precipitation === 'downpour') && wind === 'tempest' && timeOfDay === 'night') {
		return 'tempest-night';
	} else if (clouds === 'cloudy' && precipitation === 'mistyrain') {
		return 'mistyrain';
	} else if (clouds === 'variable' && precipitation === 'mistyrain' && timeOfDay === 'day') {
		return 'mistyrain-day';
	} else if (clouds === 'variable' && precipitation === 'mistyrain' && timeOfDay === 'night') {
		return 'mistyrain-night';
	} else if (clouds === 'cloudy' && precipitation === 'rain') {
		return 'rain';
	} else if (clouds === 'variable' && precipitation === 'rain' && timeOfDay === 'day') {
		return 'rain-day';
	} else if (clouds === 'variable' && precipitation === 'rain' && timeOfDay === 'night') {
		return 'rain-night';
	} else if (clouds === 'cloudy' && precipitation === 'downpour') {
		return 'downpour';
	} else if (clouds === 'variable' && precipitation === 'downpour' && timeOfDay === 'day') {
		return 'downpour-day';
	} else if (clouds === 'variable' && precipitation === 'downpour' && timeOfDay === 'night') {
		return 'downpour-night';
	} else if (clouds === 'cloudy' && precipitation === 'snow') {
		return 'snow';
	} else if (clouds === 'variable' && precipitation === 'snow' && timeOfDay === 'day') {
		return 'snow-day';
	} else if (clouds === 'variable' && precipitation === 'snow' && timeOfDay === 'night') {
		return 'snow-night';
	}

	if (timeOfDay === 'night') {
		return 'moon';
	}
	return 'sun';
}

function haveClouds(clouds) {
	if (clouds <= 30) {
		return 'no';
	} else if (clouds <= 70) {
		return 'variable';
	}
	return 'cloudy';
}

function haveWind(wind) {
	if (wind < 14) {
		return 'no';
	} else if (wind < 33) {
		return 'windy';
	}
	return 'tempest';
}

function havePrecipitation(jsonResult) {
	let rain = 0;
	let snow = 0;
	if (jsonResult.hasOwnProperty('rain') && jsonResult.rain.hasOwnProperty('1h')) {
		rain = jsonResult.rain['1h'];
	}
	if (jsonResult.hasOwnProperty('snow') && jsonResult.snow.hasOwnProperty('1h')) {
		snow = jsonResult.snow['1h'];
	}
	if (snow > rain) {
		if (snow > 0.1) {
			return 'snow';
		}
	} else if (rain >= snow) {
		if (rain !== 0) {
			return 'rain';
		}
	}
	return 'no';
}

function getTimeOfDay(jsonResult) {
	let now = new Date();
	now.setSeconds(0);
	now.setMinutes(0);
	now.setHours(0);
	now.setSeconds(now.getSeconds() + jsonResult.dt + jsonResult.timezone);
	if (now.getHours() > 21 || now.getHours() < 6) { // Todo: check timings sunrise and sunset
		return 'night';
	}
	return 'day';
}

getLocation();
addSavedCities();