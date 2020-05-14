var adminContractArtifacts = require('../build/contracts/AdminContract.json');
var votingContractArtifacts = require('../build/contracts/Voting.json');
var userContractArtifacts = require('../build/contracts/User.json');

var gethUrl = 'http://127.0.0.1:8545';

// var adminAddress = '0x83743cfff53699852d92298e67571c771b806d48';
var adminAddress = '0xc99de534c22600e1c3ceebabda7341caca50e9a6';
// var adminAddress = '0x5007002324aea81b80eb1664f5d2289dfe11af6a';
// var adminAddress = '0x83a22ea8703f0291e96b5304f8099313f023b833';
// var adminAddress = '0x3d2d3eded3edaaac0aaa8b75b7bc18647fb3c644';
var adminContractAbi = adminContractArtifacts.abi;
// var adminContractAddress = adminContractArtifacts['networks']['999'].address;
var adminContractAddress = adminContractArtifacts['networks']['1337'].address;
// var adminContractAddress = adminContractArtifacts['networks']['888'].address;
var userContractAbi = userContractArtifacts.abi;
var userByteCode = userContractArtifacts.bytecode;
// var userContractAddress = userContractArtifacts['networks']['999'].address;

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
};
