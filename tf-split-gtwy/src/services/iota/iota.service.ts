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
   * checkInitialPaymentStatus
   * 
   * Checks the status of the initial payment on the tangle.
   */
  async checkInitialPaymentStatus({bundleId, address}) {

    //TODO: set some sort of threshold somewhere.
    return false;
  }


}
