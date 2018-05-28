import { NextFunction } from 'express';
import {
  BodyParams, Controller, Next, Get, Post, QueryParams, Request, Req, Required, Response,
  Status
} from 'ts-express-decorators';
import { Returns } from 'ts-express-decorators/lib/swagger';
import { Validate, Validator } from 'typescript-param-validator';
import { StartPaymentDto } from '../../services/payment/payment.dto';
import { AuthService } from '../../services/auth/auth.service';
import { AUTH_STRATEGY } from '../../services/auth/passport/passport.service';
import { IAppRequest, IAppResponse } from '../../types/app.types';
import { HTTPStatusCodes } from '../../types/http';
import { StartPaymentRequestDto } from './payment.dto';
import { IotaService } from '../../services/iota/iota.service';
import { PaymentService } from '../../services/payment/payment.service';
import { Payment, PaymentInstance } from '../../dal/Payment';
import { PaymentState } from '../../types/payment';


@Controller('/payment')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private iotaService: IotaService,
  ) {

  }

  /**
   * Start the payment process.
   * Returns an address
   */
  @Post('/startPayment')
  @Returns(StartPaymentDto)
  @Validate()
  async startPayment(
    @Validator() @BodyParams() body: StartPaymentRequestDto,
    @Request() req: any,
    @Response() res,
    @Next() next: NextFunction
  ) {
    //get a new address
    const address = await this.iotaService.getNewAddress();
    //create a new Payment, with the state set to 'Pending'
    const payment = await this.paymentService.createPayment({address, apiKey: body.apiKey });

    res.json(payment);
  }


  /**
   * Once the payment has been made, user informs gateway, 
   * and gateway confirms payment has been made
   */
  @Post('/confirmPayment')
  async confirmPayment(
    @Required() @QueryParams('payment_id') paymentId: string,
    @Required() @QueryParams('bundle_id') bundleId: string,
    @Req() req: IAppRequest): Promise<any> {

    console.log("paymentId", paymentId);
    console.log("bundleId", bundleId);

    let payment: PaymentInstance = await this.paymentService.getPaymentById({id: paymentId});
    payment.initialPaymentBundleId = bundleId;
    const oldState = payment.state;
    payment.state = PaymentState.unverified;
    this.paymentService.handleEnterState(payment, oldState);

    await this.paymentService.save(payment);


    // //TODO: in this call, set the bundleId for the intitial payment
    // const status = await this.iotaService.checkInitialPaymentStatus({address: payment.address, bundleId });

    // //Update the state to 
    // if (status) {
    //   payment = await this.paymentService.updatePaymentState({id: paymentId, state: PaymentState.split_pending});
    // }

    //TODO: lookup the payment ID in 
    //      confirm tx on tangle
    //      update state
    //      initiate split
    
    return null;
  }

  /**
   * Get the payment status at any given point in time
   */
  @Get('/paymentState')
  async paymentState(
    @Required() @QueryParams('payment_id') paymentId: string,
    @Req() req: IAppRequest): Promise<any> {
    const payment = await this.paymentService.getPaymentById({id: paymentId});

    /*
      if we have the intialPaymentBundleId and the payment is pending or unverified, 
      then we should trigger a state check and update

      if we have the bundleIds for the split payments, and the state is split_pending or 
      split_unverified, we should trigger a state check and update
    */

    return { state: payment.state };
  }

  /**
   * Trigger to check for pending transactions, and update
   * 
   * TODO: make admin authentication only
   */
  @Get('/triggerCheckPaymentStates')
  async triggerCheckPaymentStates(
    @Req() req: IAppRequest): Promise<any> {

      //TODO: look through all pending payments (maybe save ids in redis?), and check the state for each.
      this.paymentService.checkPaymentStates();      

      return true;
  }

}