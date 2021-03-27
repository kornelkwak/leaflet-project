	const mymap = L.map('mapid', {
		maxBounds: [[-90, -260],[90, 260]],
      	maxBoundsViscosity: 1,
		minZoom: 2,
    	maxZoom: 5.5
	}).setView([51.505, -0.09], 2);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		continuousWorld: 'false',
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
	}).addTo(mymap);

let geojson = [];

fetch("world.geojson")
	.then(response => {
	return response.json();
	})
	.then(data => {
	
	geojson = L.geoJSON(data, {
		onEachFeature: onEachFeature,
		style: style
		
	}).addTo(mymap);
	
	tempID = 1;

	//Data from geojson about each country
	geojson.eachLayer(layer => {
		layer.feature.properties.layerID = tempID;
		tempID+=1;
		let countryName = layer.feature.properties.NAME_ENGL;

		//API swiftuijam.herokuapp.com COVID vaccinations
		const url_base_covid  = `https://swiftuijam.herokuapp.com/`;
 
		axios.get(url_base_covid + `newestData/${countryName}`)
 		.then(res => {
    	let total_vaccinations = res.data.total_vaccinations;
		let vaccineTypes = res.data.vaccine;
		layer.feature.properties.total_vaccinations = total_vaccinations;
			
		
		//API RapidAPI - country population
		const options = {
			method: 'GET',
			url: 'https://world-population.p.rapidapi.com/population',
			params: {country_name: `${countryName}`},
			headers: {
			  'x-rapidapi-key': 'f4f639e93emsh6edef7a01a34397p1bb44fjsn6514b4e38f11',
			  'x-rapidapi-host': 'world-population.p.rapidapi.com'
			}
		  };
		  
		  axios.request(options).then(response => {
			  let population = response.data.body.population;
			  let percentVaccinated = parseFloat(total_vaccinations/population * 100).toFixed(2);
			  
			layer.feature.properties.population = population;
			layer.feature.properties.percentVaccinated = percentVaccinated;

			//Adding style of country and popup with vaccinations data
			layer.setStyle({
				fillColor: getColor(layer.feature.properties.percentVaccinated),
				});
			layer.bindPopup(`<h3>${countryName}</h3>` 
			+ `<b>${percentVaccinated}%</b> of population is vaccinated` + '</b><br />'
			+ `<b>Total vaccinations:</b> ` +  total_vaccinations.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '</b><br />' 
			+ `<b>Population:</b> ` +  population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + '</b><br />'
			+ `<b>Vaccine:</b> ${vaccineTypes}`);
			
		  }).catch(error => {
			  console.error(error);
		  });
		
	})

});

});

const getColor = d => {
	
	return d > 50 ? '#0DA904':
		   d > 30 ? '#A6F702':
		   d > 20 ? '#E78F09':
		   d > 10 ? '#F02D0A':
		   d >= 0 ? '#C70039':
		  			'#6E6E6E';
}

const highlightFeature = e => {
	var layer = e.target;

	layer.setStyle({
		weight: 7,
		color: 'royalblue',
		fillColor: 'royalblue',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
	info.update(layer.feature.properties.NAME_ENGL);
}

const resetHighlight = e => {
	const layer = e.target;
	geojson.resetStyle(e.target);
	info.update();
	layer.setStyle({
		fillColor: getColor(layer.feature.properties.percentVaccinated),
		});
	
}

const zoomToFeature = e => {
	const layer = e.target;
	mymap.fitBounds(e.target.getBounds());
	
	
}

const onEachFeature = (feature, layer) => {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
		
	});
}

const style = feature => {
	
	return {
		
		fillColor: '#6E6E6E',
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

//Adding control panel with informations about current country	
const info = L.control();
	
info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	this.update();
	return this._div;
};

info.update = function (countryName) {
	
//API swiftuijam.herokuapp.com COVID vaccinations
	const url_base  = `https://swiftuijam.herokuapp.com/`;
 
	axios.get(url_base + `newestData/${countryName}`)
	 .then(res => {
	const total_vaccinations = res.data.total_vaccinations;
	this._div.innerHTML = '<h4>World Total COVID Vaccinations Map</h4>' + '</b><br />' +  (countryName  ?
        '<b>Country Name:</b> ' + countryName  + '</b><br />' +` <b>Total vaccinations:</b> ` +  total_vaccinations
        : 'Hover over a country');
		
})

};

info.addTo(mymap);

// Adding legend to map
const legend = L.control({position: 'bottomright'});

legend.onAdd = map => {

const div = L.DomUtil.create('div', 'info legend'),
	  grades = [0, 10, 20, 30, 50],
	  labels = [];
		div.innerHTML = '<h4>Legend:</h4>' + '<i style="background: #6E6E6E"></i> ' +  'no data' + '<br>';
		for (let i = 0; i < grades.length; i++) {
			div.innerHTML +=
				'<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
				grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '%' + '<br>' : '+');
		}
	
		return div;
};
	
legend.addTo(mymap);

//Adding map scale 
const scale = L.control.scale().addTo(mymap);