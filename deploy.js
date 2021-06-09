const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

//truffle-hdwallet-provider is a special provider that can connect to an outside node in a network, and also simultaneously unlock the account.
//First arg - account mnemonic 
//Second arg - url to what network we want to connect to : endpoints link in Infura
const provider = new HDWalletProvider(
    'carbon clean layer arrest resist world soul ripple boat oven black lumber',
    'https://rinkeby.infura.io/v3/ca8f08b842d14c80bfc995b842790aa7'
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from account ', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas:'1000000', from: accounts[0]});
    console.log(interface);
    console.log('Contract deployed to ', result.options.address);
};

deploy();