	var mymap = L.map('mapid').setView([51.505, -0.09], 2);

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
	}).addTo(mymap);

let geojson = [];

fetch("world.geojson")
	.then(function(response) {
	return response.json();
	})
	.then(function(data) {
	
	geojson = L.geoJSON(data, {
		onEachFeature: onEachFeature,
		style: style
		
	}).addTo(mymap);
	
	tempID = 1;

	geojson.eachLayer(function(layer) {
		layer.feature.properties.layerID = tempID;
		tempID+=1;
		let countryName = layer.feature.properties.NAME_ENGL;
		let isocountryID = layer.feature.properties.iso3;
		

		const url_base_covid  = `https://swiftuijam.herokuapp.com/`;
 
		axios.get(url_base_covid + `newestData/${countryName}`)
 		.then(res => {
    	let total_vaccinations = res.data.total_vaccinations;
		layer.feature.properties.total_vaccinations = total_vaccinations;
		
		layer.setStyle({
			fillColor: getColor(layer.feature.properties.total_vaccinations),
			});
		})


});
console.log();
});

function getColor(d) {
	
	return d > 100000 ? '#800026' :
		   d > 50000  ? '#BD0026' :
		   d > 20000  ? '#E31A1C' :
		   d > 10000 ? '#FC4E2A' :
		   d > 5000  ? '#FD8D3C' :
		   d > 2000   ? '#FEB24C' :
		   d > 1000   ? '#FED976' :
					  '#6E6E6E';
}

function highlightFeature(e) {
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

function resetHighlight(e) {
	const layer = e.target;
	geojson.resetStyle(e.target);
	info.update();
	layer.setStyle({
		fillColor: getColor(layer.feature.properties.total_vaccinations),
		});
	
}

function zoomToFeature(e) {
	mymap.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
		
	});
}

function style(feature) {
	
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

info.update = function(countryName) {
	

	const url_base  = `https://swiftuijam.herokuapp.com/`;
 
	axios.get(url_base + `newestData/${countryName}`)
	 .then(res => {
	const total_vaccinations = res.data.total_vaccinations;
	this._div.textContent = 'Country name: ' + countryName  + ` vaccinations: ` +  total_vaccinations;
})


};

info.addTo(mymap);