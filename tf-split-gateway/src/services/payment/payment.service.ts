import { Service, Inject } from "ts-express-decorators";
import { CreatePaymentDto } from "./payment.dto";
import { UnexpectedError } from "../../utils/error/UnexpectedError";
import { MongoErrorCode } from "../../types/mongo";
import { API_ERRORS } from "../../types/app.errors";
import { ApiError } from "../../utils/error";
import { PaymentRepository, PaymentInstance } from "../../dal/Payment";
import { PaymentRepositoryToken } from "../../dal/token-constants";
import { InitialPaymentStates, PaymentState } from "../../types/payment";


@Service() 
export class PaymentService {
  constructor(
    @Inject(PaymentRepositoryToken) private paymentRepository: PaymentRepository
  ) {

  }

  async getPaymentById({id}) {
    return await this.paymentRepository.findById(id);
  }

  async onUpdatePaymentState({id}): Promise<PaymentState> {
    const payment = await this.getPaymentById({id});

    if (InitialPaymentStates.indexOf(payment.state) > -1 &&
      payment.initialPaymentBundleId) {
        //The user claims to have made the payment, 
        //but last time we checked, it wasn't confirmed

        //TODO: check payment state
    }

    if (payment.isPendingSplitPayment()) {
      //We have initiated the split payment, but it hasn't been confirmed

      //TODO: check payment state
    }

    return payment.state;
  }

  async updatePaymentState({id, state}) {
    //TODO: handle this like a state machine with nice hooks?

    const payment = await this.paymentRepository.findById(id);
    payment.state = state;

    return await payment.save();
  }

  async save(payment) {
    return await payment.save();
  }

  async createPayment(profile: CreatePaymentDto): Promise<PaymentInstance> {
    //TODO: validate?

    const payment = new this.paymentRepository({ ...profile });
    return await payment.save();
  }
}