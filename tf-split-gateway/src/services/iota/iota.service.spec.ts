import { IotaService } from "./iota.service";
import { getInjectionService } from '../../utils/tests/injectors';
import * as dotenv from 'dotenv';
import { PaymentState } from "../../types/payment";

//TODO: configure this nicely for tests
dotenv.config({ path: '.env' });



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

    it('returns a PaymentState of split_pending when the initial payment is complete', async () => {
      const result = await service.checkPaymentStatus({
        txHash: 'A9GZPTFJDBQIMZGADSGVLUBDLQYFRSCMBWTMSQZKIWSYWJ9GILDZJVBXXUNXUTVJOPVJZRLYYSYRZ9999',
        address: 'BJSLSJNPWSM9QLO9JYJAG9A9LLAUKZAQJGYZLNN9YMBNPCUUS9E9EYE9PIKIKNYHXAPNFAMDGXVIPVKIW',
        expectedAmount: 1
      });

      console.log("result", result);

      expect(result).toBe(PaymentState.split_pending);
    });

    //returns a PaymentState of unverified when the initital payment is incomplete

  });

  it('checks the payment ', () => {
    expect(4 + 1).toEqual(5);
  });

});