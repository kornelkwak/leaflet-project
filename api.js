const url_base  = `https://swiftuijam.herokuapp.com/`;
 
axios.get(url_base + 'newestData/Poland')
 .then(res => {
    
    
    const total_vaccinations = res.data.total_vaccinations;
    
    
})

