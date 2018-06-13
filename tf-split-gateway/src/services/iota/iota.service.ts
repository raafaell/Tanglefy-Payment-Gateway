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
    const transactions = await this.iota.api.getTransactionsObjectsAsync([txHash]);
    const inclusionStates = await this.iota.api.getLatestInclusionAsync([txHash]);

    if (!transactions || !transactions[0]) {
      //Transaction not found, return unverified
      return PaymentState.unverified;
    }

    if (!inclusionStates || inclusionStates[0] === null) {
      return PaymentState.unverified;
    }

    const tx = transactions[0];
    const inclusionState = inclusionStates[0];

    if (tx.value !== expectedAmount) {
      return PaymentState.unverified;
    }

    if (tx.address !== address) {
      return PaymentState.unverified;
    }

    if (inclusionState === false) {
      // ref: https://iota.stackexchange.com/questions/1160/how-does-the-iota-wallet-determine-confirmed-transactions
      return PaymentState.unverified;
    }
    
    return PaymentState.split_pending;
  }


  /**
   * checkSplitPaymentStatus
   * 
   * Check the status for an outgoing payment on the tangle.
   * TODO: refactor with above
   */
  async checkSplitPaymentStatus({ txHash, address, expectedAmount}): Promise<SplitPaymentState> {

    const transactions = await this.iota.api.getTransactionsObjectsAsync([txHash]);
    const inclusionStates = await this.iota.api.getLatestInclusionAsync([txHash]);

    if (!transactions || !transactions[0]) {
      //Transaction not found, return unverified
      return SplitPaymentState.unverified;
    }

    if (!inclusionStates || inclusionStates[0] === null) {
      return SplitPaymentState.unverified;
    }

    const tx = transactions[0];
    const inclusionState = inclusionStates[0];

    if (tx.value !== expectedAmount) {
      return SplitPaymentState.unverified;
    }

    if (tx.address !== address) {
      return SplitPaymentState.unverified;
    }

    if (inclusionState === false) {
      // ref: https://iota.stackexchange.com/questions/1160/how-does-the-iota-wallet-determine-confirmed-transactions
      return SplitPaymentState.unverified;
    }

    return SplitPaymentState.complete;
  }


  /**
   * Make a payment
   * 
   */
  async handlePayment({address, value}): Promise<IotaPaymentDto> {

    const transfers = [{
      address,
      value
    }];

    const result = await this.iota.api.sendTransferAsync(
      this.seed,
      14,
      14,
      transfers,
    );

    //TODO: handle failure cases here?
    const transaction = result[0];
    return {
      txHash: transaction.hash,
      bundleId: transaction.bundle,
    };
  }
}
