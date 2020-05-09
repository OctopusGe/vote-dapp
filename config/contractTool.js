var adminContractArtifacts = require('../build/contracts/AdminContract.json');
var votingContractArtifacts = require('../build/contracts/Voting.json');
var userContractArtifacts = require('../build/contracts/User.json');

var gethUrl = 'http://127.0.0.1:8545';

var adminAddress = '0x83743cfff53699852d92298e67571c771b806d48';
var adminContractAbi = adminContractArtifacts.abi;
var adminContractAddress = adminContractArtifacts['networks']['999'].address;
var userContractAbi = userContractArtifacts.abi;
var userByteCode = userContractArtifacts.bytecode;
//var userContractAddress = userContractArtifacts['networks']['999'].address;

var voteContractAbi = votingContractArtifacts.abi;
var voteByteCode = votingContractArtifacts.bytecode;

module.exports = {
  gethUrl,
  adminAddress,
  adminContractAbi,
  adminContractAddress,
  voteContractAbi,
  voteByteCode,
  userContractAbi,
  userByteCode
}
