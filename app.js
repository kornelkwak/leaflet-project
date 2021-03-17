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
		layer.bindPopup(`<h4>${countryName}</h4>` + `Vaccinations: ` +  total_vaccinations.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "));
		})

});

});

function getColor(d) {
	
	return d > 5000000 ? '#0DA904' :
		   d > 2000000  ? '#A6F702' :
		   d > 1000000  ? '#E9F702' :
		   d > 500000 ? '#E78F09' :
		   d > 50000   ? '#F0760A' :
		   d > 1000   ? '#F02D0A' :
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
	const layer = e.target;
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
	this._div.innerHTML = '<h4>World Total COVID Vaccinations Map</h4>' + '</b><br />' +  (countryName  ?
        'Country Name: ' + countryName  + '</b><br />' +` Vaccinations: ` +  total_vaccinations
        : 'Hover over a country');
		
})

};

info.addTo(mymap);

