import { InjectorService, JsonProperty } from 'ts-express-decorators';
import { prop, InstanceType, Typegoose, pre, ModelType, instanceMethod, arrayProp, Ref } from "typegoose";
import { PaymentState, InitialPaymentStates } from "../types/payment";
import { User } from './User';
import { PaymentRepositoryToken } from './token-constants';
import { Split } from './Split';
import { ApiError } from '../utils/error';
import { API_ERRORS } from '../types/app.errors';


/**
 * when creating the model, make sure the state starts as 'new'
 * 
 * doesn't look like we can refactor to () => notation :(
 */
@pre<Payment>('validate', function(next) {
  const payment = this;

  if (!payment.state) {
    payment.state = PaymentState.new;
  }

  next();
})

/**
 * Make sure that splits is valid
 */
@pre<Payment>('save', function(next) {
  const payment = this;

  if (!this.isSplitsValid()) {
    const error = new ApiError(API_ERRORS.VALIDATION_ERROR);
    return next(error);
  }

  next();
})

export class Payment extends Typegoose {

  @prop({ required: true })
  @JsonProperty()
  apiKey: string;
  
  @prop({ enum: PaymentState, required: true })
  @JsonProperty()
  state: PaymentState;
  
  @prop({ required: true })
  @JsonProperty()
  address: string;

  @prop({})
  @JsonProperty()
  initialPaymentBundleId: string;

  /*An arrray containing the split definition, eg:
  [ 
    {split: 95, address:0x000},
    {split: 5, address:0x001},
  ]
  all values must add up to 100
  */
  @arrayProp({ items: Split })
  @JsonProperty()
  splits?: Split[];

  @instanceMethod
  isPendingSplitPayment() {

    //Iterate through each split payment. 

    return true;
  }

  @instanceMethod
  getSplitTotal() {
    //Iterate through the splits. If it doesn't add to 1, it is invalid
    return this.splits.reduce((acc: number, curr: Split) => {
      return acc + curr.percentSplit;
    }, 0);
  }

  @instanceMethod
  isSplitsValid() {
    if (this.getSplitTotal() !== 1) {
      return false;
    }

    return true;
  }
}


export type PaymentInstance = InstanceType<Payment>;
export type PaymentRepository = ModelType<Payment>;
InjectorService.factory(PaymentRepositoryToken, new Payment().getModelForClass(Payment));
