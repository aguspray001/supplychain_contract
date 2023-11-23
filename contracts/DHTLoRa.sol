//SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.7.0;

contract DHTLoRa{

    struct Data {
        string nodeID;
        string gatewayID;
        string data;
        uint256 unixtime;
    }

    Data[] public dataList;

    event DataStoredEvent(uint indexed index, string node_id, string gateway_id, string data, uint256 unixtime);

    function storeData(string memory _nodeID, string memory _gatewayID, string memory _data, uint256 _unixtime) public {
        Data memory newData = Data( _nodeID, _gatewayID, _data, _unixtime);
        dataList.push(newData);
        uint index = dataList.length - 1;
        emit DataStoredEvent(index, _nodeID, _gatewayID, _data, _unixtime);
    }

    function getData(uint index) public view returns (string memory, string memory, string memory, uint256){
        require(index < dataList.length, "Invalid Index");
        Data storage data = dataList[index];
        return (data.nodeID, data.gatewayID, data.data, data.unixtime);
    }
}