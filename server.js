const fs = require('fs')
const morgan = require('morgan')

const express = require('express')

const app = express()
const args = require('minimist')(process.argv.slice(2))

// If --help, echo help text and exit
if (args.help || args.h) {
    console.log(`
    server.js [options]
    --port, -p	Set the port number for the server to listen on. Must be an integer
                between 1 and 65535.
    --debug, -d If set to true, creates endlpoints /app/log/access/ which returns
                a JSON access log from the database and /app/error which throws 
                an error with the message "Error test successful." Defaults to 
                false.
    --log		If set to false, no log files are written. Defaults to true.
                Logs are always written to database.
    --help, -h	Return this message and exit.
    `)
    process.exit(0)
}

const db = require('./database.js')
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const port = args.port ||  5555

/** Coin flip functions 
 * This module will emulate a coin flip given various conditions as parameters as defined below
 */

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads
 * 
 */

 function coinFlip() {
    return Math.floor(Math.random() * 2) == 0 ? "tails" : "heads"
  }
  
  /** Multiple coin flips
   * 
   * Write a function that accepts one parameter (number of flips) and returns an array of 
   * resulting "heads" or "tails".
   * 
   * @param {number} flips 
   * @returns {string[]} results
   * 
   * example: coinFlips(10)
   * returns:
   *  [
        'heads', 'heads',
        'heads', 'tails',
        'heads', 'tails',
        'tails', 'heads',
        'tails', 'heads'
      ]
   */
  
  function coinFlips(flips) {
    if (flips < 1 || typeof flips ==="undefined"){
      flips = 1;
    }
    const results = [];
    for(var i = 0; i < flips; i++) {
      results.push(coinFlip());
    }
    return results;
  }
  
  /** Count multiple flips
   * 
   * Write a function that accepts an array consisting of "heads" or "tails" 
   * (e.g. the results of your `coinFlips()` function) and counts each, returning 
   * an object containing the number of each.
   * 
   * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
   * { tails: 5, heads: 5 }
   * 
   * @param {string[]} array 
   * @returns {{ heads: number, tails: number }}
   */
  
  function countFlips(array) {
    let hNum = 0;
    let tailCount = 0;
    for (var i = 0; i < array.length; i++) {
      if(array[i].localeCompare('heads')) {
        hNum++;
      } else {
        tailCount++;
      } // we can assume only heads or tails as we are providing the array ourselves
    }
    return {heads: tailCount,tails: hNum};
  }
  
  /** Flip a coin!
   * 
   * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
   * 
   * @param {string} call 
   * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
   * 
   * example: flipACoin('tails')
   * returns: { call: 'tails', flip: 'heads', result: 'lose' }
   */
  
  function flipACoin(call) {
    let flip = coinFlip();
    return {call: call, flip: flip, result: flip == call ? "win" : "lose" }
  }


// Start an app server
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`)
});

if (args.log == 'false') {
  console.log("Nothing")

} else {
  const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
  app.use(morgan('combined', { stream: accessLog }))
}

app.use((req, res, next) => {
  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referrer: req.headers['referer'],
      useragent: req.headers['user-agent']
  };
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent)
  next();
})
app.get("/app", (req, res, next) => {
res.status(200).send("API test");
});

if (args.debug || args.d) {
  app.get('/app/log/access/', (req, res, next) => {
      const stmt = db.prepare("SELECT * FROM accesslog").all();
    res.status(200).json(stmt);
  })

  app.get('/app/error/', (req, res, next) => {
      throw new Error('Error test')
  })
}

app.use(function(req, res) {
  res.status(404).send("404 NOT FOUND")
  res.type("text/plain")  
})