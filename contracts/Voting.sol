pragma solidity >=0.4.18;

contract Voting {
	// 投票人的投票信息
	struct Voter {
		address voterAddress;              // 投票人地址
		bool voted;						   // 是否已经投票，默认为false
		uint tokensBought;				   // 已经购买的token
		uint[] tokensUsedPerCandidate;	   // 给每位候选人投票的信息
		uint lastVoteTime;                 // 最近一次投票时间
		uint lastBoughtTokensTime;		   // 最近一次购买token时间
	}
	// 投票信息地址映射
	mapping (address => Voter) voterInfo;
	// 候选人票数映射
	mapping (bytes32 => uint) votesReceived;

	// 所有投票者的地址
	address[] voterAddresses;

	// 发布该投票的拥有者
	address owner;
	// 投票标题
	string proposal;
	// 候选人列表
	bytes32[] candidateList;
	// 候选人列表
	uint[] candidateVotesList;
	// 投票类型：1.简单投票（一人一票） 2.token投票 3.每日投票（一人一天一票）
	uint voteType;
	uint totalTokens;
	uint balanceTokens;
	uint tokenPrice;
	uint startTime;
	uint endTime;

	// 管理员合约实例
	//AdminContract adminContract;

	constructor(address _owner, string memory _proposal, uint _voteType, uint tokens, uint pricePerToken,
		bytes32[] memory candidateNames, uint _startTime, uint _endTime) public payable {
		owner = _owner;
		proposal = _proposal;
		voteType = _voteType;
		candidateList = candidateNames;
		totalTokens = tokens;
		balanceTokens = tokens;
		tokenPrice = pricePerToken;
		startTime = _startTime;
		endTime = _endTime;
		// 通过地址拿到合约实例   --  将地址强制转换为合约
		//adminContract = AdminContract(_adminContractAddr);
	}

	modifier timeLimit(){
		require((block.timestamp >= startTime && block.timestamp <= endTime), "投票未开始或已经结束");
		_;
	}

	// 购买token
	function buyTokens() timeLimit public payable returns (uint tokensToBuy) {
		require(voteType == 2, "非token投票");
		tokensToBuy = msg.value / tokenPrice;
		require(tokensToBuy <= balanceTokens, "超出剩余token总数");
		//控制购买token频率
		require(voterInfo[msg.sender].lastBoughtTokensTime == 0 || ((block.timestamp - voterInfo[msg.sender].lastBoughtTokensTime) > 10), "购买太频繁");
		voterInfo[msg.sender].voterAddress = msg.sender;
		voterInfo[msg.sender].tokensBought += tokensToBuy;
		balanceTokens -= tokensToBuy;
		voterInfo[msg.sender].lastBoughtTokensTime = block.timestamp;
		return tokensToBuy;
	}


	// 获取简单和每日投票信息
	function getVoteInfo() public returns(bytes32[] memory _candidateList, uint[] memory _votesList, uint _totalVoters) {
		return (candidateList, getAllCandidateVotes(), voterAddresses.length);
	}

	// 获取token投票信息
	function getTokenVoteInfo() public returns(bytes32[] memory _candidateList, uint[] memory _votesList, uint _balanceTokens, uint _totalVoters) {
		return (candidateList, getAllCandidateVotes(), balanceTokens, voterAddresses.length);
	}

	// 获取单个候选人的得票数
	function getAllVoter() public view returns (address[] memory voterAddressList) {
		return voterAddresses;
	}

	// 获取单个候选人的得票数
	function getCandidateVotes(bytes32 candidate) public view returns (uint votes) {
		return votesReceived[candidate];
	}

	// 获取所有候选人的得票数
	function getAllCandidateVotes() public returns (uint[]  memory votesList) {
		delete candidateVotesList;
		for(uint i = 0; i < candidateList.length; i++) {
			if (uint(0) == votesReceived[candidateList[i]]) {
				candidateVotesList.push(0);
			} else {
				candidateVotesList.push(votesReceived[candidateList[i]]);
			}
		}
		return candidateVotesList;
	}

	// 简单投票
	function simpleVoteForCandidate(bytes32 candidate) timeLimit public payable {
		require(voteType == 1, "非简单投票");
		uint index = indexOfCandidate(candidate);
		require(index != uint(-1), "候选人不存在");
		voterInfo[msg.sender].voterAddress = msg.sender;
		require(!voterInfo[msg.sender].voted, "已投票");

		// 初始化投票信息
		initVoteInfo(msg.sender);

		votesReceived[candidate] += 1;
		voterInfo[msg.sender].tokensUsedPerCandidate[index] = 1;
		voterInfo[msg.sender].voted = true;
		voterInfo[msg.sender].lastVoteTime = block.timestamp;
		//msg.sender.transfer(adminContract.getAward());
	}

	// token投票
	function tokenVoteForCandidate(bytes32 candidate, uint votesInTokens) timeLimit public payable{
		require(voteType == 2, "非token投票");
		uint index = indexOfCandidate(candidate);
		require(index != uint(-1), "候选人不存在");
		require(voterInfo[msg.sender].lastVoteTime == 0 || ((block.timestamp - voterInfo[msg.sender].lastVoteTime) > 5), "投票太频繁");

		// 初始化投票信息
		initVoteInfo(msg.sender);

		uint availableTokens = voterInfo[msg.sender].tokensBought - totalTokensUsed(voterInfo[msg.sender].tokensUsedPerCandidate);
		require (availableTokens >= votesInTokens, "投票数超出购买的token剩余总数");

		votesReceived[candidate] += votesInTokens;
		voterInfo[msg.sender].tokensUsedPerCandidate[index] += votesInTokens;
		voterInfo[msg.sender].lastVoteTime = block.timestamp;
        voterInfo[msg.sender].voted = true;
		// token价值大于一个以太，将会获取回报
		//if (votesInTokens * tokenPrice >= 1 ether) {
		//	msg.sender.transfer(adminContract.getAward());
		//}
	}

	// 每日投票
	function dailyVoteForCandidate(bytes32 candidate) timeLimit public payable {
		require(voteType == 3, "非每日投票");
		uint index = indexOfCandidate(candidate);
		require(index != uint(-1), "候选人不存在");
		voterInfo[msg.sender].voterAddress = msg.sender;
		require(voterInfo[msg.sender].lastVoteTime == 0 || (block.timestamp - voterInfo[msg.sender].lastVoteTime) > 1 days, "今日已投票");

		// 初始化投票信息
		initVoteInfo(msg.sender);

		votesReceived[candidate] += 1;
		voterInfo[msg.sender].tokensUsedPerCandidate[index] += 1;
		voterInfo[msg.sender].voted = true;
		voterInfo[msg.sender].lastVoteTime = block.timestamp;
		//msg.sender.transfer(adminContract.getAward());
	}

	// 初始化投票信息
	function initVoteInfo(address _voterAddress) private {
		if (voterInfo[_voterAddress].tokensUsedPerCandidate.length == 0) {
			voterAddresses.push(_voterAddress);
			for (uint i = 0; i < candidateList.length; i++) {
				voterInfo[_voterAddress].tokensUsedPerCandidate.push(0);
			}
		}
	}

	// token总使用量
	function totalTokensUsed(uint[] memory _tokensUsedPerCandidate) private pure returns (uint totalUsedTokens) {
		totalUsedTokens = 0;
		for(uint i = 0; i < _tokensUsedPerCandidate.length; i++) {
			totalUsedTokens += _tokensUsedPerCandidate[i];
		}
		return totalUsedTokens;
	}

	// 候选人下标
	function indexOfCandidate(bytes32 candidate) public view returns (uint index) {
		for(uint i = 0; i < candidateList.length; i++) {
			if (candidateList[i] == candidate) {
				return i;
			}
		}
		return uint(-1);
	}

	// 获取单个用户的简单和每日投票详情
	function getVoterDetails(address user) public view returns (bytes32[] memory _candidateList, uint[] memory tokensUsedPerCandidate) {
		return (candidateList, voterInfo[user].tokensUsedPerCandidate);
	}

	// 获取单个用户的token投票详情
	function getTokenVoterDetails(address user) public view returns (uint tokensBought, uint tokenUsed, bytes32[] memory _candidateList, uint[] memory tokensUsedPerCandidate) {
		return (voterInfo[user].tokensBought, totalTokensUsed(voterInfo[user].tokensUsedPerCandidate), candidateList, voterInfo[user].tokensUsedPerCandidate);
	}

	// 获取所有候选人
	function getAllCandidates() public view returns (bytes32[] memory _candidateList) {
		return candidateList;
	}

	function transferTo(address account) public {
		//account.transfer(this.balance);
		address(uint160(account)).transfer(address(this).balance);
	}

	function()external payable{}
}
