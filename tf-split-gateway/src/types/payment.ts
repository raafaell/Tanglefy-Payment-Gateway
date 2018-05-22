export enum PaymentState {
  new='new',
  pending='pending',
  unverified='unverified',
  split_pending='split_pending',
  split_unverified='split_unverified',
  complete='complete',
}

export const InitialPaymentStates = [
  PaymentState.new,
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