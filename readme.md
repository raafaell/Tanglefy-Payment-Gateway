




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