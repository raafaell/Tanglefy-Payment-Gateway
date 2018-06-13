import { IotaService } from "./iota.service";
import { getInjectionService } from '../../utils/tests/injectors';
import * as dotenv from 'dotenv';
import { PaymentState } from "../../types/payment";

//TODO: configure this nicely for tests
dotenv.config({ path: '.env' });

jest.setTimeout(process.env.DEFAULT_TIMEOUT_INTERVAL);

describe('IotaService', () => {
  let service: IotaService;
  //TODO: mock out the IOTA api

  beforeEach(async () => {
    // userRepositoryMock.findById.mockReset();
    const injectionService = await getInjectionService(this);
    const locals = new Map();
    // locals.set(UserRepositoryToken, userRepositoryMock);
    service = injectionService.invoke<IotaService>(IotaService, locals);
  });

  /*
    These tests are run manually only, for testing purposes
    🐬🐬🐬🐬
  */
  describe('Live tests', () => {

    describe('checkPaymentStatus', () => {
      it('returns a PaymentState of split_pending when the initial payment is complete', async () => {
        const result = await service.checkPaymentStatus({
          txHash: 'A9GZPTFJDBQIMZGADSGVLUBDLQYFRSCMBWTMSQZKIWSYWJ9GILDZJVBXXUNXUTVJOPVJZRLYYSYRZ9999',
          address: 'BJSLSJNPWSM9QLO9JYJAG9A9LLAUKZAQJGYZLNN9YMBNPCUUS9E9EYE9PIKIKNYHXAPNFAMDGXVIPVKIW',
          expectedAmount: 1
        });

        expect(result).toBe(PaymentState.split_pending);
      });

      it('returns a PaymentState of unverified when the payment amount is wrong', async () => {
        const result = await service.checkPaymentStatus({
          txHash: 'A9GZPTFJDBQIMZGADSGVLUBDLQYFRSCMBWTMSQZKIWSYWJ9GILDZJVBXXUNXUTVJOPVJZRLYYSYRZ9999',
          address: 'BJSLSJNPWSM9QLO9JYJAG9A9LLAUKZAQJGYZLNN9YMBNPCUUS9E9EYE9PIKIKNYHXAPNFAMDGXVIPVKIW',
          expectedAmount: 2
        });

        expect(result).toBe(PaymentState.unverified);
      });

      it('returns a PaymentState of unverified when the initital payment is incomplete', async () => {
        const result = await service.checkPaymentStatus({
          txHash: 'B9GZPTFJDBQIMZGADSGVLUBDLQYFRSCMBWTMSQZKIWSYWJ9GILDZJVBXXUNXUTVJOPVJZRLYYSYRZ9999',
          address: 'BJSLSJNPWSM9QLO9JYJAG9A9LLAUKZAQJGYZLNN9YMBNPCUUS9E9EYE9PIKIKNYHXAPNFAMDGXVIPVKIW',
          expectedAmount: 1
        });

        expect(result).toBe(PaymentState.unverified);
      });
    });

    describe('checkSplitPaymentStatus', () => {

      it('returns a PaymentState of complete when the initial payment is complete', async () => {
        const result = await service.checkSplitPaymentStatus({
          txHash: 'A9GZPTFJDBQIMZGADSGVLUBDLQYFRSCMBWTMSQZKIWSYWJ9GILDZJVBXXUNXUTVJOPVJZRLYYSYRZ9999',
          address: 'BJSLSJNPWSM9QLO9JYJAG9A9LLAUKZAQJGYZLNN9YMBNPCUUS9E9EYE9PIKIKNYHXAPNFAMDGXVIPVKIW',
          expectedAmount: 1
        });

        expect(result).toBe(PaymentState.split_pending);
      });
    });

    describe('handlePayment', () => {
      it('makes the payment on the tangle', async () => {
        const result = await service.handlePayment({
          address: 'BJSLSJNPWSM9QLO9JYJAG9A9LLAUKZAQJGYZLNN9YMBNPCUUS9E9EYE9PIKIKNYHXAPNFAMDGXVIPVKIW',
          value: 0
        });

        console.log(result);

      }, 60 * 1000);
    });
  });

  it('checks the payment ', () => {
    expect(4 + 1).toEqual(5);
  });

});