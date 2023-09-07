const { WebSocketServer } = require('ws')
const RedisClient = require('./redis/redisClient')
const statsDclient = require('./statsD')
const express = require('express')
const app = express()
<<<<<<< HEAD
app.listen(8000,() => {
console.log('running')
=======
app.listen(8000, () => {
  console.log('running')
>>>>>>> b8a7db41532ed31f8349f75cd11367101e23d80f
})

app.get('/health', (req, res) => {
  res.send('success')
})

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
  ws.on('message', function message(rdata) {
    const bufferData = Buffer.from(rdata)
    const data = JSON.parse(bufferData.toString('utf8'))

    const startTime = Date.now()
    statsDclient.timing('websocket_message_received', 1)
    Count.increment();
    console.log(`Message received count = ${Count.getCount()}`)
    const key = data?.key ?? 'DEFAUTL_KEY'
    const value = data?.value ?? 'DEFAUTL_VALUE'
    console.log("data : ", data)
    const requestCount = data?.message_count

    RedisClient.setKey(key, value).then(response => {
      const endTime = Date.now()
      statsDclient.timing('websocket_message_send', 1)
      statsDclient.timing('websocket_message_response', endTime - startTime)
      ws.send(JSON.stringify({
        'message': 'Added redis key success',
        'response': response,
        'message_count': requestCount
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
  ws.send(JSON.stringify({
    'message': 'connected to server',
    'response': true,
    'requestcount': 0,
  }));
  // }, 2000);
});
