pragma solidity >=0.4.18;


// 声明其他合约的接口  -- 授权合约
interface AdminContract {
	function getAdminAddress() external view returns (address);

	function getAward() external view returns (uint);

	function getUploadSection() external view returns (uint);
}

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
	mapping (address => Voter) public voterInfo;
	// 候选人票数映射
	mapping (bytes32 => uint) votesReceived;

	// 所有投票者的地址
	address[] public voterAddresses;

	// 发布该投票的拥有者
	address owner;
	// 投票标题
	string voteTitle;
	// 候选人列表
	bytes32[] candidateList;
	// 投票类型：1.简单投票（一人一票） 2.token投票 3.每日投票（一人一天一票）
	uint voteType;
	uint totalTokens;
	uint balanceTokens;
	uint tokenPrice;
	uint startTime;
	uint endTime;
	bytes32 winner;

	// 管理员合约实例
	AdminContract adminContract;

	constructor(address _owner, address _adminContractAddr, string _voteTitle, uint _voteType, uint tokens, uint pricePerToken,
		bytes32[] memory candidateNames, uint _startTime, uint _endTime) public {
		owner = _owner;
		voteTitle = _voteTitle;
		voteType = _voteType;
		candidateList = candidateNames;
		totalTokens = tokens;
		balanceTokens = tokens;
		tokenPrice = pricePerToken;
		startTime = _startTime;
		endTime = _endTime;
		// 通过地址拿到合约实例   --  将地址强制转换为合约
		adminContract = AdminContract(_adminContractAddr);
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
		require(voterInfo[msg.sender].lastBoughtTokensTime == 0 || ((block.timestamp - voterInfo[msg.sender].lastBoughtTokensTime) > adminContract.getUploadSection()), "购买太频繁");
		voterInfo[msg.sender].voterAddress = msg.sender;
		voterInfo[msg.sender].tokensBought += tokensToBuy;
		balanceTokens -= tokensToBuy;
		voterInfo[msg.sender].lastBoughtTokensTime = block.timestamp;
		return tokensToBuy;
	}

	// 获取票数最多的候选人和票数
	function getWinner() public returns (bytes32 _winner, uint votes) {
		_winner = candidateList[0];
		votes = votesReceived[candidateList[0]];
		for(uint i = 0; i < candidateList.length; i++) {
			if (votes < votesReceived[candidateList[i]]) {
				_winner = candidateList[i];
				votes = votesReceived[candidateList[i]];
			}
		}
		winner = _winner;
		return (_winner, votes);
	}

	// 获取总票数
	function getTotalVotes() public view returns (uint votes) {
		for(uint i = 0; i < candidateList.length; i++) {
			votes += votesReceived[candidateList[i]];
		}
	}


	// 获取投票信息
	function getVoteInfo() public returns(address _owner, string memory _voteTitle, bytes32[] _candidateList, uint _voteType,
		uint _totalTokens, uint _balanceTokens, uint _tokenPrice, uint _startTime, uint _endTime, bytes32 _winner,
		uint _winnerVotes, uint _totalVoters, uint _totalVotes) {
		_owner =owner;
		_voteTitle = voteTitle;
		_voteType = voteType;
		_candidateList = candidateList;
		_totalTokens = _totalTokens;
		_balanceTokens = _balanceTokens;
		_tokenPrice = _tokenPrice;
		_startTime = startTime;
		_endTime = endTime;
		(_winner,_winnerVotes) = getWinner();
		_totalVoters = voterAddresses.length;
		_totalVotes = getTotalVotes();
	}

	// 获取单个候选人的得票数
	function getCandidateVotes(bytes32 candidate) public view returns (uint votes) {
		return votesReceived[candidate];
	}

	// 获取所有候选人的得票数
	function getAllCandidateVotes() public view returns (bytes32[] candidates, uint[] votesList) {
		for(uint i = 0; i < candidateList.length; i++) {
			candidates[i] = candidateList[i];
			votesList[i] = votesReceived[candidateList[i]];
		}
		return (candidates, votesList);
	}

	// 简单投票
	function simpleVoteForCandidate(bytes32 candidate) timeLimit public payable {
		require(voteType == 2, "非简单投票");
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
		msg.sender.transfer(adminContract.getAward());
	}

	// token投票
	function tokenVoteForCandidate(bytes32 candidate, uint votesInTokens) timeLimit public payable{
		require(voteType == 2, "非token投票");
		uint index = indexOfCandidate(candidate);
		require(index != uint(-1), "候选人不存在");
		require(voterInfo[msg.sender].lastVoteTime == 0 || ((block.timestamp - voterInfo[msg.sender].lastVoteTime) > adminContract.getUploadSection()), "投票太频繁");

		// 初始化投票信息
		initVoteInfo(msg.sender);

		uint availableTokens = voterInfo[msg.sender].tokensBought - totalTokensUsed(voterInfo[msg.sender].tokensUsedPerCandidate);
		require (availableTokens >= votesInTokens, "投票数超出购买的token剩余总数");

		votesReceived[candidate] += votesInTokens;
		voterInfo[msg.sender].tokensUsedPerCandidate[index] += votesInTokens;
		voterInfo[msg.sender].lastVoteTime = block.timestamp;
		// token价值大于一个以太，将会获取回报
		if (votesInTokens * tokenPrice >= 1 ether) {
			msg.sender.transfer(adminContract.getAward());
		}
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
		msg.sender.transfer(adminContract.getAward());
	}

	// 初始化投票信息
	function initVoteInfo(address _voterAddress) public {
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

	// 出售的token总数
	function tokensSold() public view returns (uint) {
		return totalTokens - balanceTokens;
	}

	// 获取单个用户的简单和每日投票详情
	function getVoterDetails(address user) public view returns (bytes32[] memory _candidateList, uint[] memory tokensUsedPerCandidate) {
		return (candidateList, voterInfo[user].tokensUsedPerCandidate);
	}

	// 获取单个用户的token投票详情
	function getTokenVoterDetails(address user) public view returns (uint tokensBought, bytes32[] memory _candidateList, uint[] memory tokensUsedPerCandidate) {
		return (voterInfo[user].tokensBought, candidateList, voterInfo[user].tokensUsedPerCandidate);
	}

//	// 获取每日投票详情
//	function getDailyVoterDetails(address user) public view returns (uint[] memory tokensUsedPerCandidate) {
//		return (voterInfo[user].tokensUsedPerCandidate);
//	}

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
