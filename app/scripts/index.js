// Import the page's CSS. Webpack will know what to do with it.
import '../styles/app.css'

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

import voting_artifacts from '../../build/contracts/Voting.json'
import user_artifacts from '../../build/contracts/User.json';
import web3Util from './Web3Util.js';
//import keythereum from 'keythereum';
 
let datadir = "/Users/stone/geth-project/myDevChina2/keystore";

let Voting = contract(voting_artifacts);
let User = contract(user_artifacts);

let candidates = {};

let tokenPrice = null;

window.login = function(){
	let account = $("#l-user-name").val();
    let password = $("#l-password").val();
    if (!account || !password) {
		$("#login-msg").html("用户名或者密码不能为空！！！");
	} else {
		User.deployed().then(function(contractInstance) {
			if (web3.isAddress(account)){
				web3Util.unlockAccount(account, password, (err, result) => {
					if (result) {
						contractInstance.findUser(account).then((result) =>{
							if(result) {
								console.log(result[1]);
								let privateKey = getPrivateKey(address, password);
								$("#login-msg").html('登录成功！\n地址：' + result[0] + "\n用户名：" + result[1] + "\n私钥：" + privateKey);
							}
						});
					} else {
						$("#login-msg").html('用户名或密码错误');
					}
				});
			} else { //account is username
				console.log("findUserAddressByUsername:" + account);
				contractInstance.findUserAddressByUsername(account).then((address) => {
					console.log(address);
					if (web3.utils.isAddress(address)){
						web3Util.unlockAccount(address, password, (err, result) => {
							if (err)
								$("#login-msg").html('用户名或密码错误');
							if(result)
								contractInstance.findUser(address).then((result) =>{
									if(result){
										console.log(result[1]);
										let privateKey = getPrivateKey(address, password);
										$("#login-msg").html('登录成功！\n地址：' + result[0] + "\n用户名：" + result[1] + "\n私钥：" + privateKey);
									}
								});
						});
					} else {
						$("#login-msg").html('用户名不存在！');
					}
				});
			}
		});
	}
}

window.register = function() {
	let username = $("#r-user-name").val();
    let password = $("#r-password").val();
    if (!username || !password) {
		$("#register-msg").html("用户名或者密码为空！！！");
	} else {
		User.deployed().then(function(contractInstance) {
			console.log("isExitUsername:" + username);
			contractInstance.isExitUsername.call(username).then(result =>{
				if(result) {
					$("#register-msg").html('用户名已存在');
				} else {
					web3.personal.newAccount(password, (err, address) => {
						if (err) {
							$("#register-msg").html("创建用户失败！！！");
						} else {
							console.log("createUser:" + username);
							contractInstance.createUser(address, username, {gas: 1400000, from: web3.eth.accounts[0]}).then(result => {
								if(result){
									$("#register-msg").html("注册成功！你的地址是：" + address);
									//getPrivateKey(address, password);
								}
							});
						}
					});
				}
			});
		});
	}
}

window.voteForCandidate = function(candidate) {
	let candidateName = $("#candidate").val();
	let voteTokens = $("#vote-tokens").val();
	$("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
	$("#candidate").val("");
	$("#vote-tokens").val("");
	Voting.deployed().then(function(contractInstance) {
		contractInstance.voteForCandidate(candidateName, voteTokens, {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
			let div_id = candidates[candidateName];
			return contractInstance.totalVotesFor.call(candidateName).then(function(v) {
				$("#" + div_id).html(v.toString());
				$("#msg").html("");
			});
		});
	});
};

window.buyTokens = function() {
	let tokensToBuy = $("#buy").val();
	let price = tokensToBuy * tokenPrice;
	$("#buy-msg").html("Purchase order has been submitted. Please wait.");
	Voting.deployed().then(function(contractInstance) {
		contractInstance.buy({value: web3.utils.toWei(price.toString(), 'ether'), from: web3.eth.accounts[0]}).then(function(v) {
			$("#buy-msg").html("");
			web3.eth.getBalance(contractInstance.address, function(error, result) {
				$("#contract-balance").html(web3.utils.fromWei(result.toString()) + " Ether");
			});
		})
	});
	populateTokenData();
};

window.lookupVoterInfo = function() {
	let address = $("#voter-info").val();
	Voting.deployed().then(function(contractInstance) {
		contractInstance.voterDetails.call(address).then(function(v) {
			$("#tokens-bought").html("Total Tokens bought: " + v[0].toString());
			let votesPerCandidate = v[1];
			$("#votes-cast").empty();
			$("#votes-cast").append("Votes cast per candidate: <br>");
			let allCandidates = Object.keys(candidates);
			for(let i=0; i < allCandidates.length; i++) {
				$("#votes-cast").append(allCandidates[i] + ": " + votesPerCandidate[i] + "<br>");
			}
		});
	});
};

function populateCandidates() {
	Voting.deployed().then(function(contractInstance) {
		contractInstance.allCandidates.call().then(function(candidateArray) {
			for(let i=0; i < candidateArray.length; i++) {
				/* We store the candidate names as bytes32 on the blockchain. We use the
				* handy toUtf8 method to convert from bytes32 to string
				*/
				candidates[web3.utils.toUtf8(candidateArray[i])] = "candidate-" + i;
			}
			setupCandidateRows();
			populateCandidateVotes();
			populateTokenData();
		});
	});
};

function setupCandidateRows() {
	Object.keys(candidates).forEach(function (candidate) { 
		$("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
	});
};

function populateCandidateVotes() {
	let candidateNames = Object.keys(candidates);
	for (var i = 0; i < candidateNames.length; i++) {
		let name = candidateNames[i];
		Voting.deployed().then(function(contractInstance) {
			contractInstance.totalVotesFor.call(name).then(function(v) {
				$("#" + candidates[name]).html(v.toString());
			});
		});
	}
};

function populateTokenData() {
	Voting.deployed().then(function(contractInstance) {
		contractInstance.totalTokens.call().then(function(v) {
			$("#tokens-total").html(v.toString());
		});
		contractInstance.tokensSold.call().then(function(v) {
			$("#tokens-sold").html(v.toString());
		});
		contractInstance.tokenPrice.call().then(function(v) {
			tokenPrice = parseFloat(web3.utils.fromWei(v.toString()));
			$("#token-cost").html(tokenPrice + " Ether");
		});
		web3.eth.getBalance(contractInstance.address, function(error, result) {
			$("#contract-balance").html(web3.utils.fromWei(result.toString()) + " Ether");
		});
	});
};

// function getPrivateKey(address, password){
//     var fromkey = importFromFile(address, "/Users/stone/geth-project/myDevChina2");
//     //recover输出为buffer类型的私钥
//     var privateKey = recover(password, fromkey);
//     console.log(privateKey.toString('hex'));
//     return privateKey.toString('hex');
// }

$( document ).ready(function() {
	if (typeof web3 !== 'undefined') {
		console.warn("Using web3 detected from external source like Metamask")
		// Use Mist/MetaMask's provider
		window.web3 = new Web3(web3.currentProvider);
	} else {
		console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
		// fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
		window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}
	Voting.setProvider(web3.currentProvider);
	User.setProvider(web3.currentProvider);

	populateCandidates();

});
