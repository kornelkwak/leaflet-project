.eachLayer(function(layer) {
    layer.feature.properties.layerID = tempID;
    tempID+=1;

    for (let i = 0; i <= countries.length; i++) {

        const url_base  = `https://swiftuijam.herokuapp.com/`;
        
        axios.get(url_base + `newestData/${countries[i]}`)
         .then(res => {
        const country_total_vaccinations = res.data.total_vaccinations;
        const test = geojson;
        console.log(test);
    })};


geojson.eachLayer(function(layer) {
    layer.feature.properties.layerID = tempID;
    tempID+=1;
    console.log(layer.feature.properties)
