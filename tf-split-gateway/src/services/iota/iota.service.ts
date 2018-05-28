import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as IOTA from 'iota.lib.js';
import * as bluebird from 'bluebird';

import { Inject, Service } from 'ts-express-decorators';
import { UserRepositoryToken } from '../../dal/token-constants';
import { AuthProviderEnum, UserInstance, UserRepository } from '../../dal/User';
import { API_ERRORS } from '../../types/app.errors';
import { MongoErrorCode } from '../../types/mongo';
import { ApiError } from '../../utils/error';
import { UnexpectedError } from '../../utils/error/UnexpectedError';
import { Request, Response, NextFunction } from 'express';
import { PaymentState, SplitPaymentState } from '../../types/payment';
import { IotaPaymentDto } from './iota.dto';
import { Split } from '../../dal/Split';


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
   */
  async checkPaymentStatus({bundleId, address, expectedAmount}): Promise<PaymentState> {

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
  async handlePayment({address, value, }): Promise<IotaPaymentDto> {

    return {
      bundleId: "bundleId",
    };
  }
}
