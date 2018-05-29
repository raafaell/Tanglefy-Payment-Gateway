import { JsonProperty } from 'ts-express-decorators';


export interface CreatePaymentDto {
  address: string;
  apiKey: string;
  value: number; //in iota
}

export class StartPaymentDto {
  //one-time address user should pay to
  @JsonProperty()
  address: string;

}