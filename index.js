const express = require("express");
const app = express();
const port = 3000;
const axios  =  require('axios');
const {connect, redisClient} = require("./redis");




app.get("/", (req, res) => {
  res.send("Hello World!");
});
// call redis connect function
connect()



async function fetchApiData(species) {
  const apiResponse = await axios.get(
    `https://www.fishwatch.gov/api/species/${species}`
  );
  console.log("Request sent to the API");
  return apiResponse.data;
}

async function getSpeciesData(req, res) {
  const species = req.params.species;
  let results;
let isCached  =  false
  try {
    // check if avilable data on redis in memory server
    const cacheResult  =  await redisClient.get(species)
    if( cacheResult){
        isCached=true
        results =  JSON.parse(cacheResult)
        console.log("data get from cache server")
    }
    else{
      // for the first time api hit the database to retrive data
      results = await fetchApiData(species);
      if (results.length === 0) {
        throw "API returned an empty array";
      }
      console.log("data get from api server")
      // after sucessfully get data from database then set it to redis in memory server for caching
      await redisClient.set(species,JSON.stringify(results),{
        // implement 1 minute(60 second) system for remove cached data
        EX:60,
        NX:true
      })
    }
  
    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

app.get("/fish/:species", getSpeciesData);
















app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
