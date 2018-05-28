export enum PaymentState {
  //Waiting for payment
  pending='pending',
  //Buyer claims to have made payment
  unverified='unverified',
  //Waiting for split payments to complete
  split_pending='split_pending',
  //split payments are claimed to be complete
  split_unverified='split_unverified',
  complete='complete',
}

export const InitialPaymentStates = [
  PaymentState.pending,
  PaymentState.unverified,
];


//Keep track of the state of sub or split payments within the
//larger payment
export enum SplitPaymentState {
  pending='pending',
  unverified='unverified',
  complete='complete',
}