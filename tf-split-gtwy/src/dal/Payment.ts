import { InjectorService, JsonProperty } from 'ts-express-decorators';
import { prop, InstanceType, Typegoose, pre, ModelType, instanceMethod, arrayProp, Ref } from "typegoose";
import { PaymentState, InitialPaymentStates } from "../types/payment";
import { User } from './User';
import { PaymentRepositoryToken } from './token-constants';
import { Split } from './Split';


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
  @arrayProp({ itemsRef: Split })
  @JsonProperty()
  splits?: Ref<Split>[];

  @instanceMethod
  isPendingSplitPayment() {

    //Iterate through each split payment.


  }
}


export type PaymentInstance = InstanceType<Payment>;
export type PaymentRepository = ModelType<Payment>;
InjectorService.factory(PaymentRepositoryToken, new Payment().getModelForClass(Payment));
