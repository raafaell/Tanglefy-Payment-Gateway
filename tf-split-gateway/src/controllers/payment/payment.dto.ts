import { IsEmail, IsNotEmpty as Required, IsOptional, IsUrl, MinLength } from 'class-validator';
import { JsonProperty } from 'ts-express-decorators';


export class StartPaymentRequestDto {
  
  @JsonProperty()
  @Required()
  apiKey: string;

  @JsonProperty()
  @Required()
  value: number;

}