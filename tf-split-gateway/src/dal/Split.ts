import { Typegoose, prop } from "typegoose";
import { SplitPaymentState } from "../types/payment";
import { JsonProperty } from "ts-express-decorators";

// export interface Split {
//   split: number,
//   state: PaymentState,
//   address: string,
//   bundleId: string,
// }


export class Split extends Typegoose {

  @prop({ required: true })
  @JsonProperty()
  percentSplit: number;

  @prop({ enum: SplitPaymentState, required: true })
  @JsonProperty()
  state: SplitPaymentState;

  @prop({ required: true })
  @JsonProperty()
  address: string;

  @prop({ required: true })
  @JsonProperty()
  bundleId: string;
}