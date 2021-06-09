const path = require('path');//build a directory path from compile.js file to inbox.sol
const fs = require('fs');//file system module to directly read from Inbox.sol
//above two are standard modules, no need to npm install them

const solc = require('solc');//solidity compiler

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
//__dirname goes to parent folder - to Inbox 
//path directly to Inbox.sol

const source = fs.readFileSync(lotteryPath, 'utf8');
// read from file

module.exports = solc.compile(source,1).contracts[':Lottery'];
//2nd argument of compile function is the number of contracts we are attempting to compile
//module.export in order to ensure that a simple require of the compile file yeilds the output immediately
//Since the compiler can compile multiple contracts concurrently, it returns an object called contracts which has a list of key-value pairs where the key identifies each contract. Since we are only working with a single contract, better to access its result here itself instead of exporting the entire result object.