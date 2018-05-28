import { Service, Inject } from "ts-express-decorators";
import { CreatePaymentDto } from "./payment.dto";
import { UnexpectedError } from "../../utils/error/UnexpectedError";
import { MongoErrorCode } from "../../types/mongo";
import { API_ERRORS } from "../../types/app.errors";
import { ApiError } from "../../utils/error";
import { PaymentRepository, PaymentInstance, Payment } from "../../dal/Payment";
import { PaymentRepositoryToken } from "../../dal/token-constants";
import { InitialPaymentStates, PaymentState, SplitPaymentState } from "../../types/payment";
import { Split } from "../../dal/Split";
import { IotaService } from "../iota/iota.service";
import { RedisService } from "../shared/redis.service";


@Service() 
export class PaymentService {
  constructor(
    @Inject(PaymentRepositoryToken) private paymentRepository: PaymentRepository,
    private iotaService: IotaService,
    private redisService: RedisService,
  ) {

  }

  async getPaymentById({id}) {
    return await this.paymentRepository.findById(id);
  }

  /**
   * Get all pending payments from Redis, and update state
   * 
   * 
   */
  async checkPaymentStates() {
    const pending = await RedisService.getPendingTx();

    console.log("pending payments are: ", pending);

    pending.forEach(async (id) => {
      const newState = await this.checkPaymentState({id});

      const pendingStates = [
        // PaymentState.pending, //I don't think so - waiting for user, not some magic external change
        PaymentState.unverified,
        // PaymentState.split_pending, //actually, we're waiting for the gateway to handle this
        PaymentState.split_unverified
      ];

      //Remove from the pending txs if necessary
      if (pendingStates.indexOf(newState) === -1) {
        console.log("[checkPaymentStates] removing payment from redis as it is no longer pending");
        RedisService.deletePendingTx(id);
      }
    });
  }

  async checkPaymentState({id}): Promise<PaymentState> {
    console.log("checkPaymentState for id:", id);
    const payment = await this.getPaymentById({id});
    const oldState = payment.state;

    //Payment is waiting for user
    if (payment.state === PaymentState.pending) {
      //Do nothing, as we need user to let us know the details of the tx.
      console.log("[checkPaymentState], payment is PENDING.");

      return payment.state;
    }

    //User claims to have made payment, we haven't yet confirmed
    if (payment.state === PaymentState.unverified) {
      console.log("[checkPaymentState], payment is UNVERIFIED.");
      payment.state = await this.iotaService.checkPaymentStatus({
        bundleId: payment.initialPaymentBundleId,
        address: payment.address,
        expectedAmount: 0,
      });

      await payment.save();
      await this.handleEnterState(payment, oldState);

      return payment.state;
    }

    //TODO: check payment state for splits
    if (payment.state === PaymentState.split_unverified) {
      console.log('[checkPaymentState] state is split_unverified, checking split tx states');

      //TODO: I think this is messing up somewhere, as this has to be called twice
      await Promise.all(payment.splits.map(async split => {
        if (split.state === SplitPaymentState.unverified) {
          split.state = await this.iotaService.checkSplitPaymentStatus({
            bundleId: split.bundleId,
            address: split.address,
            expectedAmount: 0,
          });
        }
      }));

      //Only change the state once all splits are complete
      const completeSplits = payment.splits.reduce((acc: number, curr: Split) => {
        if (curr.state === SplitPaymentState.complete) {
          acc++
        }
        return acc;
      }, 0);

      if (completeSplits === payment.splits.length) {
        payment.state = PaymentState.complete;
      }

      await payment.save();
      await this.handleEnterState(payment, oldState);

      return payment.state;
    }

    return payment.state;
  }

  async handleEnterState(payment:PaymentInstance, oldState: PaymentState) {
    if (payment.state === oldState) {
      console.log(`[WARNING] tried to transition between the same state: ${oldState} -> ${payment.state}. This won't be handled.`);
    }

    //TODO: handle state transitions, not just current state.

    switch (payment.state) {

      case PaymentState.unverified: {
        console.log("payment.service: handleEnterState, payment is unverified");
        RedisService.addPendingTx(payment.id);

        break;
      }

      case PaymentState.split_pending: {
        console.log("Payment moved to split_pending. Initiating split payments");
        
        //TODO: calculate value based on splits
        //iterate through the splits, and make the payments!
        await Promise.all(payment.splits.map(async (split: Split, idx) => {
          const result = await this.iotaService.handlePayment({address: split.address, value: 0});
          
          split.bundleId = result.bundleId;
          split.state = SplitPaymentState.unverified;
          payment.splits[idx] = split; //TODO: do we need this?
        }));

        await payment.save();

        //do only if the above is successful:
        payment.state = PaymentState.split_unverified;
        await payment.save();
        await this.handleEnterState(payment, oldState);

        break;
      }

      case PaymentState.split_unverified: {
        //Add to Redis as a pending tx:
        RedisService.addPendingTx(payment.id);

        break;
      }

      default: 
        console.log(`unhandled payment state transition: ${oldState} -> ${payment.state}`);
    }
  }

  async save(payment): Promise<PaymentInstance> {
    return await payment.save();
  }

  async createPayment(profile: CreatePaymentDto): Promise<PaymentInstance> {
    //TODO: validate?

    //TODO: initialize the splits based on the api key, including:
    // - split percentage, unique address for the tangelfy and seller wallets
    const splits = [
      { percentSplit: 0.95, state: SplitPaymentState.pending, address:"12345" },
      { percentSplit: 0.05, state: SplitPaymentState.pending, address:"12345" },
    ];


    const payment = new this.paymentRepository({ ...profile, splits });
    const savedPayment = await this.save(payment);

    this.handleEnterState(savedPayment, null);

    return savedPayment;
  }
}