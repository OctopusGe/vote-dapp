pragma solidity >=0.4.18;

contract User {
    // 定义用户数据结构
    struct User_Info {
        address userAddress;           // 用户地址
        uint voteCount;                // 投票次数
        uint voteProject;              // 投票项目次数
        uint myVoteCount;              // 发布投票的次数
        uint lastVoteTime;             // 最近一次投票的时间
        uint lastCreateVoteTime;       // 最近一次发布投票的时间
    }

    // 给其它投票项目投票的数据
    struct Voted_Data{
        address voteAddress;              // 投票合约地址
        address ownerAddress;             // 发布投票者地址
        bytes32[] candidateList;          // 候选人列表
        uint[] myVoteForCandidate;        // 我给每位候选人的投票详情
    }

    // 用户信息
    User_Info  user;

    address[] myVoteAddresses;

    // 投票地址映射
    mapping(address => Voted_Data) votedData;

    uint[] voteForCandidate;

    // 构造函数 -- 指定用户的地址
    constructor(address _userAddress) public payable {
        user.userAddress = _userAddress;
        user.voteCount = 0;
        user.voteProject = 0;
        user.myVoteCount = 0;
        user.lastVoteTime = 0;
        user.lastCreateVoteTime = 0;
    }

    // 函数修改器，判断是否为当前用户
    modifier isOwner(){
        require(msg.sender == user.userAddress, "没有权限");
        _;
    }

    // 获取用户个人信息
    function getUserInfo(address call) public view returns (uint voteCount, uint voteProject, uint myVoteCount, uint lastVoteTime, uint lastCreateVoteTime) {
        require(call == user.userAddress, "没有权限");
        return (user.voteCount, user.voteProject, user.myVoteCount, user.lastVoteTime, user.lastCreateVoteTime);
    }

    // 第一次投票
    function firstVote(address _voteAddress, address _owner, bytes32[] memory _candidateList, bytes32 _candidate, uint _votes) isOwner public returns (bool isSuccess){
        delete voteForCandidate;
        for (uint i = 0; i < _candidateList.length; i++) {
            if (_candidateList[i] == _candidate) {
                voteForCandidate.push(_votes);
            } else {
                voteForCandidate.push(0);
            }
        }
        Voted_Data memory vote = Voted_Data({
            voteAddress : _voteAddress,
            ownerAddress : _owner,
            candidateList : _candidateList,
            myVoteForCandidate : voteForCandidate
            });
        votedData[_voteAddress] = vote;
        user.lastVoteTime = block.timestamp;
        user.voteProject += 1;
        user.voteCount += 1;
        if (_owner == user.userAddress) {
            myVoteAddresses.push(_voteAddress);
            user.myVoteCount += 1;
            user.lastCreateVoteTime = block.timestamp;
        }
        return true;
    }

    // 添加投票数据
    function addVoteData(address _voteAddress, bytes32 _candidate, uint _votes) isOwner public returns (bool isSuccess){
        bytes32[] memory candidateList = votedData[_voteAddress].candidateList;
        uint candidateIndex = indexOfCandidate(_candidate, candidateList);
        require(candidateIndex != uint(-1), "候选人不存在");
        votedData[_voteAddress].myVoteForCandidate[candidateIndex] += _votes;
        user.voteCount += 1;
        user.lastVoteTime = block.timestamp;
        return true;
    }

    // 候选人下标
    function indexOfCandidate(bytes32 candidate, bytes32[] memory _candidateList) public pure returns (uint _index) {
        for(uint i = 0; i < _candidateList.length; i++) {
            if (_candidateList[i] == candidate) {
                return i;
            }
        }
        return uint(-1);
    }

    // 是否给投票合约投过票
    function isVoted(address _userAddress, address _voteAddress) public view returns (bool) {
        require(user.userAddress == _userAddress, "没有权限");
        return votedData[_voteAddress].candidateList.length != 0;
    }

    // 获取投票数据
    function getVoteData(address _userAddress, address _voteAddress) public view returns (address voteAddress, address owner, bytes32[] memory candidateList, uint[] memory myVoteForCandidate) {
        require(user.userAddress == _userAddress, "没有权限");
        return (votedData[_voteAddress].voteAddress, votedData[_voteAddress].ownerAddress, votedData[_voteAddress].candidateList, votedData[_voteAddress].myVoteForCandidate);
    }

    // 获取本用户发布的投票合约地址
    function getMyVoteAddresses(address _userAddress) public view returns (address[] memory _voteAddressList) {
        require(user.userAddress == _userAddress, "没有权限");
        return myVoteAddresses;
    }

    function()external payable{}
}