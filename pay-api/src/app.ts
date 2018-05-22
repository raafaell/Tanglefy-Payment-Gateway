const IOTA = require('iota.lib.js');
const request = require('request-promise-native');
const promise = require("bluebird");

let iota = new IOTA({ provider: `https://testnet140.tangle.works` });

promise.promisifyAll(iota.api);

// const getNewAddressAsync = promisify(iota.api.getNewAddress);

//generate an address
//send to this address, with a tag

const send = async () => {
  const address = process.env.SPLIT_GATEWAY_ADDRESS;
  console.log('sending to address', address);

  const transfer = await iota.api.sendTransferAsync(
    'SEEDUSER', 
    10,
    10,
    [{
      address,
      value: 0,
      message: '99999',
      tag: 'TANGLEFYTEST',
    }]
  );

  console.log(transfer);

}

send();