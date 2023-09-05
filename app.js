const { WebSocketServer } = require('ws')
const RedisClient = require('./redis/redisClient')
const wss = new WebSocketServer({ port: 8080 });



class Count {
  static request_count = 0;
  static setInitial() {
    this.request_count = 0;
  }
  static increment() {
    this.request_count = this.request_count + 1
    return this.request_count
  }
  static getCount() {
    return this.request_count
  }
}



wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    Count.increment();
    console.log(`Message received count = ${Count.getCount()}`)
    const key = data?.key ?? 'DEFAUTL_KEY'
    const value = data?.key ?? 'DEFAUTL_VALUE'

    RedisClient.setKey(key, value).then(response => {
      ws.send(JSON.stringify({
        'message': 'Added redis key success',
        'response': response
      }))
    }).catch(err => {
      console.log('Error received')
      ws.send(JSON.stringify({
        'message': 'Error while setting redis key',
        'error': err
      }))
    })

  });

  // setInterval(() => {
  //   count += 1
  ws.send(`connected to websocket server`);
  // }, 2000);
});