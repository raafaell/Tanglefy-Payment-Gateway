


## Manual testing split gateway:


```bash
#startPayment
curl -X POST \
  http://0.0.0.0:3000/v1/payment/startPayment \
  -H 'Content-Type: application/json' \
  -d '{
	"apiKey":"12345"
}'


#confirmPayment
#called after making payment
PAYMENT_ID=5b0228c6773e5b4887ef979a
BUNDLE_ID="12345"
curl -X GET "http://0.0.0.0:3000/v1/payment/confirmPayment?payment_id=$PAYMENT_ID&bundle_id=$BUNDLE_ID"


#getPaymentState
#called at any stage. Use this to update UI when the payment has actually happened
PAYMENT_ID=5b0228c6773e5b4887ef979a
curl -X GET "http://0.0.0.0:3000/v1/payment/paymentState?payment_id=$PAYMENT_ID"

```




## Mongo reference:

https://docs.mongodb.com/manual/reference/mongo-shell/

```bash
docker-compose up
docker exec -it mongodb mongo


show databases
use tsstarterdb;
show collections

#list all
db.getCollection('payments').find().pretty()

```



## Splitting an IOTA Transaction

This is an interesting idea, and while it cannot be done in a trustless manner (yet), we should still pursue it.

I think it should work like the following:
1. buyer queries Tanglefy service, gets the address that should be used, based on an API Key
2. buyer pays over tangle, then notifies tangle service that payment has been made,
with the bundle id
3. payment service verifies that payment has been made (tells the buyer by setting transaction state to pending), and initiates the split transactions
4. payment service waits while transactions are pending, once they are approved, sets the transaction state to processed or failed
5. Once transaction state changes to processed, seller is notified to ship, and user is updated etc...


### Older version
1. Payment is made to an intermediary (split gateway)
2. Split Gateway recieves the payment, and from the message determines the main address where it needs to go
   - either the address could be inside the message (version 1), or we could incorporate a naming service/api key on the tangle that we use to get
     the most current address (version 2)
   - The fee address and % split should be predetermined, so that it can't be tampered with.
3. Goods should be released once all 3 transactions are confirmed.



Later on:

- use MAM, and store transaction state on the tangle instead of REST for above
-  Once Qubic is released, will be able to use smart contracts on the tangle, thus hopefully rework this system into one that doesn't rely on trusting the 'split gateway', or makes the split gateway more secure.







