const {createClient} =  require('redis')
let redisClient = createClient({
    url: "redis://localhost:6379"
  });
  redisClient.on('error', (err) => {

    console.log(err);
  });
  redisClient.on('connect', (err) => {
    //   logger.('RedisConneted', ' wow redis connected');
    console.log('redis connected')
    console.log(err);
  });
  const connect  =  async()=>{
    await redisClient.connect()
  }
  module.exports  = {
    redisClient,
    connect
  }