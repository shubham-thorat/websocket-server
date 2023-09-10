const { WebSocketServer } = require('ws')
const RedisClient = require('./redis/redisClient')
const statsDclient = require('./statsD')
const express = require('express')
const app = express()

app.listen(8000, () => {
  console.log('running')
})

app.get('/health', (req, res) => {
  res.send('success')
})

const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
  }
});



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
    statsDclient.timing('request_received', 1)
    const key = data?.key ?? 'DEFAUTL_KEY'
    const value = data?.value ?? 'DEFAUTL_VALUE'
    const requestCount = data?.message_count
    Count.increment()
    console.log("REQUEST_COUNT : ", requestCount, "  TOTAL_COUNT: ", Count.getCount())
    RedisClient.setKey(key, value).then(response => {
      const endTime = Date.now()
      statsDclient.timing('request_end', 1)
      statsDclient.timing('response_time', endTime - startTime)
      ws.send(JSON.stringify({
        'message': 'Added redis key success',
        'response': response,
        'message_count': requestCount,
        "received_time": startTime
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
