import { Service, Inject } from "ts-express-decorators";
import { CreatePaymentDto } from "./payment.dto";
import { UnexpectedError } from "../../utils/error/UnexpectedError";
import { MongoErrorCode } from "../../types/mongo";
import { API_ERRORS } from "../../types/app.errors";
import { ApiError } from "../../utils/error";
import { PaymentRepository, PaymentInstance } from "../../dal/Payment";
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

  async checkPaymentState({id}): Promise<PaymentState> {
    const payment = await this.getPaymentById({id});
    const oldState = payment.state;

    if (InitialPaymentStates.indexOf(payment.state) > -1 &&
      payment.initialPaymentBundleId) {
      //The user claims to have made the payment, 
      //but last time we checked, it wasn't confirmed

      payment.state = await this.iotaService.checkPaymentStatus({
        bundleId: payment.initialPaymentBundleId,
        address: payment.address,
        expectedAmount: 0,
      });

      await payment.save();
      await this.handleEnterState({ payment, oldState});
    }

    //TODO: implement check state for split transactions
    // if (payment.isPendingSplitPayment()) {
    //   //We have initiated the split payment, but it hasn't been confirmed
    //   //TODO: check payment state and update for each
    //   payment.splits.forEach(split => {
    //     if ()
    //   });
    // }

    return payment.state;
  }

  async handleEnterState({ payment, oldState }) {
    //TODO: handle this like a state machine with nice hooks?

    switch (payment.state) {
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
        await this.handleEnterState({ payment, oldState: PaymentState.split_pending });

        break;
      }

      case PaymentState.split_unverified: {
        console.log("Payment moved to split_unverified. TODO: start pinging tangle to check on payment status");

        //TODO: schedule a notification? How do we handle this nicely? Perhaps with rabbit mq?
        //eg: https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html

        break;
      }

      default: 
        console.log(`unhandled payment state transition: ${oldState} -> ${payment.state}`);
    }
  }

  async save(payment) {
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
    return await payment.save();
  }
}