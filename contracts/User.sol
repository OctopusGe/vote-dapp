pragma solidity >=0.4.18;

contract User {
    // 定义用户数据结构
    struct User_Info {
        address userAddress;
        string username;
        uint lastVoteTime;    // 最近一次投票时间
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
    // 所有的投票信息
    Voted_Data[] public v_data;

    // 投票地址映射
    mapping(address => Voted_Data) public votedData;

    // 投票地址下标映射
    mapping(address => uint) public index;

    uint[] voteForCandidate;

    // 构造函数 -- 指定用户的地址
    constructor(address _userAddress, string memory _username) public{
        user.userAddress = _userAddress;
        user.username = _username;
        user.lastVoteTime = 0;
    }

    // 函数修改器，判断是否为当前用户
    modifier isOwner(){
        require(msg.sender == user.userAddress, "没有权限");
        _;
    }

    // 获取用户个人信息
    function getUserInfo() isOwner public view returns (address userAddress, string memory username, uint lastVoteTime) {
        return (user.userAddress, user.username, user.lastVoteTime);
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
        v_data.push(vote);
        votedData[_voteAddress] = vote;
        index[_voteAddress] = v_data.length - 1;
        return true;
    }

    // 添加投票数据
    function addVoteData(address _voteAddress, bytes32 _candidate, uint _votes) isOwner public returns (bool isSuccess){
        bytes32[] memory candidateList = votedData[_voteAddress].candidateList;
        uint candidateIndex = indexOfCandidate(_candidate, candidateList);
        require(candidateIndex != -1, "候选人不存在");
        votedData[_voteAddress].myVoteForCandidate[candidateIndex] += _votes;
        v_data[index[_voteAddress]].myVoteForCandidate[candidateIndex] += _votes;
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

    function isVoted(address _voteAddress) public view returns (bool) {
        return votedData[_voteAddress].myVoteForCandidate.length == 0;
    }
}