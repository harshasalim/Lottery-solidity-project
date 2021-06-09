const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async ()=>{
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode})
        .send({ from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract', () => {

    it('deploys a contract',() => {
        assert.ok(lottery.options.address);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from : accounts[0],
            //method in web3 library to convert ether to wei
            value : web3.utils.toWei('0.02','ether')
        });
        
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        //assert.equal(value it should be, value it is)
        assert.strictEqual(accounts[0],players[0]);
        assert.strictEqual(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from : accounts[0],
            value : web3.utils.toWei('0.02','ether')
        });

        await lottery.methods.enter().send({
            from : accounts[1],
            value : web3.utils.toWei('0.02','ether')
        });

        await lottery.methods.enter().send({
            from : accounts[2],
            value : web3.utils.toWei('0.02','ether')
        });
        
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.strictEqual(accounts[0],players[0]);
        assert.strictEqual(accounts[1],players[1]);
        assert.strictEqual(accounts[2],players[2]);
        assert.strictEqual(3, players.length);
    });

    it('requires a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from : accounts[0],
                value : 200
            });
            assert(false);//Incase the above transaction does not fail, then only will it reach this statement.
            //Ideally it should throw an error and jump to catch statements
            //If it doesnt and executes the above assertion, then the test will fail
        } catch (err) {
            assert(err);//test passed
        }
    });

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from : accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('sends money to the winner and resets the players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2','ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({ from: accounts[0] });

        const finalBalance = await web3.eth.getBalance(accounts[0]);

        //Difference between the two balances is not exactly 2 ether
        //Some additonal money was also lost by accounts[0] as gas for these transactions
        //Difference will be slightly less than 2 ether.

        const difference = finalBalance - initialBalance;
        //console.log(difference);
        assert(difference > web3.utils.toWei('1.8', 'ether')); 
        
        
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });
        assert.strictEqual( 0, players.length);

        const balance = await web3.eth.getBalance(lottery.options.address);
        assert.strictEqual( '0', balance);

    });

});
