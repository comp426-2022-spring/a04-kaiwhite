// Require Express.js
const express = require('express')
const { count } = require('yargs')
const app = express()

const args = require('minimist')(process.argv.slice(2))
args["port"]
var port = args.port || 5000 || process.env.PORT

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
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});


app.get('/app/', (req, res) => {
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
    });
// Default response for any other request

//single flip
app.get('/app/flip', (req, res) => {
    res.status(200).json({"flip" : coinFlip()})
});

//many flip
app.get('/app/flips/:number', (req, res) => {
	let flips = coinFlips(req.params.number);
  let final = countFlips(flips)
	res.status(200).json({'raw' : flips, 'summary' : final});
});

//guess flip
app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin("tails"))
});

app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin("heads"))
});

app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});
