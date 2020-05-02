pragma solidity >=0.4.21 <0.7.0;

contract AdminContract{
    address adminAddress;       // 具备管理权限的地址
    //uint payForVoteData;      // 单次授权消耗的以太币
    //uint validSection;          // 授权有效时间间隔
    uint uploadSection;         // 投票有效时间间隔
    uint award;                 // 用户投票可获得的奖励

    constructor() public{
        adminAddress = msg.sender;
        //payForVoteData = 200000000000000000;  // 0.2ETH
        //validSection = 1 * 60 * 60;
        uploadSection = 60;
        award = 100000000000000000;             // 0.1ETH
    }

    function getAdminAddress() public view returns(address){
        return adminAddress;
    }

    function setAdminAddress(address newAddr) public{
        require(msg.sender == adminAddress, "没有授权");
        adminAddress = newAddr;
    }

//    function getPayForVoteData() public view returns(uint){
//        return payForVoteData;
//    }
//
//    function setPayForVoteData(uint newPayForVoteData) public{
//        require(msg.sender == adminAddress, "没有授权");
//        payForVoteData = newPayForVoteData;
//    }
//
//    function getValidSection() public view returns(uint){
//        return validSection;
//    }
//
//    function setValidSection(uint newValidSection) public{
//        require(msg.sender == adminAddress, "没有授权");
//        validSection = newValidSection;
//    }

    function getUploadSection() public view returns(uint){
        return uploadSection;
    }

    function setUploadSection(uint newUploadSection) public{
        require(msg.sender == adminAddress, "没有授权");
        uploadSection = newUploadSection;
    }

    function getAward() public view returns(uint){
        return award;
    }

    function setAward(uint newAward) public{
        require(msg.sender == adminAddress, "没有授权");
        award = newAward;
    }
}
