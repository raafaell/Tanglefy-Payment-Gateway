import * as IOTA from 'iota.lib.js';
import * as bluebird from 'bluebird';

import { Service } from 'ts-express-decorators';
import { PaymentState, SplitPaymentState } from '../../types/payment';
import { IotaPaymentDto } from './iota.dto';


@Service() 
export class IotaService {
  iota: any;
  seed: string = process.env.PG_SEED;
  provider: string = process.env.IOTA_PROVIDER;

  constructor() {
    this.iota = new IOTA({ provider: this.provider });
    bluebird.promisifyAll(this.iota.api);
  }

  /**
   * Gets a unique, one-off address for the Payment Gateway
   */
  async getNewAddress() {
    // const options = { index: 0, security: 2, checksum: true };
    const address = await this.iota.api.getNewAddressAsync(this.seed);
    
    return address;
  }

  /**
   * checkPaymentStatus
   * 
   * Checks the status of a payment on the tangle. Not 100% sure about
   * which fields we will need
   * 
   * TODO: make generic for any type of payment
   * @param txHash - String: the id of the bundle containing the payment
   * @param address - String: the destination address the payment has been made to
   * @param expectedAmount - Number: the expected amount of the payment, in i
   */
  async checkPaymentStatus({txHash, address, expectedAmount}): Promise<PaymentState> {

    const transactions = await this.iota.api.getTransactionObjectsAsync([txHash]);
    console.log("transactions are:", transactions);


    //TODO: set some sort of threshold of confirmations somewhere.
    return PaymentState.split_pending;
  }


  /**
   * checkSplitPaymentStatus
   * 
   * Check the status for an outgoing payment on the tangle.
   * 
   */
  async checkSplitPaymentStatus({bundleId, address, expectedAmount}): Promise<SplitPaymentState> {

    //TODO: actually check the status on the tangle
    return SplitPaymentState.complete;
  }


  /**
   * Make a payment
   * 
   */
  async handlePayment({address, value}): Promise<IotaPaymentDto> {

    return {
      bundleId: "bundleId",
    };
  }
}
