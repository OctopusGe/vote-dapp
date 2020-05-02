pragma solidity >=0.4.18;


// 声明其他合约的接口  -- 授权合约
interface AdminContract{
    function getAdminAddress()  external view returns(address);
}

contract User {
    // 定义用户数据结构
    struct UserStruct {
        address userAddress;
        string username;
        uint time;
        uint index;
    }

    // 定义用户列表数据结构
    struct UserListStruct {
        address userAddress;
        uint index;
    }

    // 所有地址集合
    address[] public userAddresses;
    // 所有用户名集合
    string[] public usernames;
    // 账户个人信息
    mapping(address => UserStruct) private userStruct;
    // 用户名映射地址
    mapping(string => UserListStruct) private userListStruct;

    // 管理员合约实例
    AdminContract adminContract;

    // 构造函数 -- 指定调用合约的地址
    constructor(address _adminContractAddr) public{
        adminContractAddr = _adminContractAddr;
        adminContract = AdminContract(adminContractAddr);   // 通过地址拿到合约实例   --  将地址强制转换为合约
    }

    // 判断用户地址是否存在
    function isExitUserAddress(address _userAddress) public view returns (bool) {
        if (userAddresses.length == 0) return false;
        return userAddresses[userStruct[_userAddress].index] == _userAddress;
    }

    // 判断用户名是否存在
    function isExitUsername(string memory _username) public view returns (bool) {
        if (usernames.length == 0) {
            return false;
        } else {
            return keccak256(abi.encodePacked(usernames[userListStruct[_username].index])) == keccak256(abi.encodePacked(_username));
        }
    }

    // 根据用户名查找对于的address
    function findUserAddressByUsername(string memory _username) public view returns (address) {
        require(isExitUsername(_username), "用户名不存在");
        return userListStruct[_username].userAddress;
    }

    // 创建用户信息
    function createUser(address _userAddress, string memory _username) public returns (uint index) {
        assert(msg.sender == adminContract.getAdminAddress());
        // 如果地址已存在则不允许再创建
        require(!isExitUserAddress(_userAddress), "用户已经存在");

        // 地址集合push新地址
        userAddresses.push(_userAddress);
        userStruct[_userAddress] = UserStruct(_userAddress, _username, block.timestamp, userAddresses.length - 1);

        // 用户名集合push新用户
        usernames.push(_username);
        // 用户所对应的地址集合
        userListStruct[_username] = UserListStruct(_userAddress, usernames.length - 1);

        return userAddresses.length - 1;
    }

    // 获取用户个人信息
    function findUser(address _userAddress) public view returns (address userAddress, string memory username, uint time, uint index) {
        require(isExitUserAddress(_userAddress), "用户地址不存在");
        return (
        userStruct[_userAddress].userAddress,
        userStruct[_userAddress].username,
        userStruct[_userAddress].time,
        userStruct[_userAddress].index);
    }
}