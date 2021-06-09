pragma solidity ^0.4.17;

contract Lottery {
    //Address type available in Solidity
    address public manager;
    //Dynamic array created to allow unlimited entries to the lottery
    address[] public players;
    
    function Lottery() public{
        //Find the address of the peron who created the contract
        //Global variable that is included anytime we invoke a function in a Solidity contract
        //This is the message object - msg : has details about who sent the object + some details regarding transaction
        //AVAILABLE WITH ANY FUNCTION INVOCATION
        //Has 4 important properties : msg.data - data field from the call or transaction that invoked the current function
        //msg.gas - amount of gas the current function has available 
        //msg.sender - address of the account that started the current function invocation
        //msg.value - amount of ether in wei that was sent along with the function invocation
        manager = msg.sender;
    }
    
    function enter() public payable {
        //Require is a global function where if the specified condition is not met, it will immediately exit the function, no changes made to the contract.
        //Ensure that any participant entering the lottery pay a minimum amount of ether 
        require(msg.value > .01 ether);
        //Issue with require()- if it doesnt meet the condition, the error message does not give any information as to why the error was caused
        //In Remix there is a debugging tool that helps to play through each instance of execution to find the error causing factor
        players.push(msg.sender);
    }
    
    function random() private view returns(uint){
        //There is no random generator in Solidity - so we create a pseudo random generator
        //Take current block difficulty(time taken to process actual transaction)+current time+addresses of players = feed to SHA3 algorithm 
        //Not actually a random number as it is possible to determine the above three factors
        //sha3() is the same as keccak256() - sha3() is an instance of it
        //block is a global variable that we have access to at any given time
        //now is also a global variable
        //sha3() returns a hash - convert it to an integer
        return uint(keccak256(block.difficulty, now, players));
    }
    
    function pickWinner() public restricted {
        //Ensure that the person calling this function is the manager
        //require(msg.sender == manager); now the modifier restricted takes care of it
        //Call random()%players.length to get winner's index
        uint index = random() % players.length;
        //address type has a set of methods associated with it - one is transfer
        //Send all the money present on this instance of the contract
        players[index].transfer(this.balance);
        //Empty the players array
        players = new address[](0);
    }
    
    //Modifiers used to avoid redundant code
    modifier restricted(){
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns(address[]){
        return players;
    }
    
}