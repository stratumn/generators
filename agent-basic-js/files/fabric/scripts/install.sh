#!/bin/sh

set -x

MAX_RETRY=5
DELAY=1

verifyResult () {
	if [ $1 -ne 0 ] ; then
		echo "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!" 1>&2
    	echo "========= ERROR !!! FAILED to initialize network ===========" 1>&2
		echo 1>&2
   		exit 1
	fi
}

createChannelWithRetry () {
	counter=0
	while [ $counter -lt $MAX_RETRY ]; do
		peer channel create -o orderer.example.com:7050 -c $CHANNEL_ID -f $CONFIG_PATH/channel.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA >&log.txt
		res=$?
		if [ $res == 0 ]; then
			break
		fi
		echo "Failed to create channel, retrying in $DELAY seconds"
		sleep $DELAY
		((++counter))
	done
	verifyResult $res "After $MAX_RETRY attempts, failed to create channel"
}

joinWithRetry () {
	counter=0
	while [ $counter -lt $MAX_RETRY ]; do
		peer channel join -b mychannel.block >&log.txt
		res=$?
		if [ $res == 0 ]; then
			break
		fi
		echo "Failed to join peer to channel, retrying in $DELAY seconds"
		sleep $DELAY
		((++counter))
	done
	verifyResult $res "After $MAX_RETRY attemps, failed to join peer to channel"
}

# Check if network is already running
peer chaincode query -C $CHANNEL_ID -n $CHAINCODE_ID -c '{"Function":"GetValue","Args":["none"]}' >&log.txt

# If not create channel, join channel, install and instantiate chaincode
if [ $? -ne 0 ]; then

	echo "Creating channel..."
	createChannelWithRetry
	echo "===================== Channel \"$CHANNEL_ID\" is created successfully ===================== "

	echo "Joining peer to channel..."
	joinWithRetry
	echo "===================== PEER joined on the channel \"$CHANNEL_ID\" ===================== "

	echo "Updating anchor peer for org1..."
	peer channel update -o orderer.example.com:7050 -c $CHANNEL_ID -f $CONFIG_PATH/Org1MSPanchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA
	verifyResult $?  "Anchor peer update failed"
	echo "===================== Anchor peers for org \"$CORE_PEER_LOCALMSPID\" on \"$CHANNEL_ID\" is updated successfully ===================== "

	echo "Installing chaincode on peer0.org1.example.com..."
	peer chaincode install -n $CHAINCODE_ID -v 1.0 -p github.com/stratumn/chaincode/pop
	verifyResult $? "Chaincode installation on remote peer has Failed"
	echo "===================== Chaincode is installed on remote peer ===================== "

	echo "Instantiate chaincode..."
	peer chaincode instantiate -o orderer.example.com:7050 --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_ID -n $CHAINCODE_ID -v 1.0 -c '{"Args":[]}' -P "AND ('Org1MSP.member')"
	verifyResult $? "Chaincode instantiation on peer on channel '$CHANNEL_ID' failed"
	echo "===================== Chaincode Instantiation on peer on channel '$CHANNEL_ID' is successful ===================== "

fi

echo ""
echo "===================== Network ready and initialized ======================== "
echo ""
