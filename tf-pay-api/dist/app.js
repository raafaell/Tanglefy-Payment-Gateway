var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const IOTA = require('iota.lib.js');
const request = require('request-promise-native');
const promise = require("bluebird");
let iota = new IOTA({ provider: `https://testnet140.tangle.works` });
promise.promisifyAll(iota.api);
// const getNewAddressAsync = promisify(iota.api.getNewAddress);
//generate an address
//send to this address, with a tag
const send = () => __awaiter(this, void 0, void 0, function* () {
    const address = process.env.SPLIT_GATEWAY_ADDRESS;
    console.log('sending to address', address);
    const transfer = yield iota.api.sendTransferAsync('SEEDUSER', 10, 10, [{
            address,
            value: 0,
            message: '99999',
            tag: 'TANGLEFYTEST',
        }]);
    console.log(transfer);
});
send();
//# sourceMappingURL=app.js.map