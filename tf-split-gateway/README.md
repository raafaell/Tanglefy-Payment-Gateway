
## Split Gateway


Split Gateway is the web service Tanglefy uses to verify, route and split transactions from the PayApi.



## Running Locally

```bash
#use docker to set up local dependencies
docker-compose up -d

#watch ts, nodemon etc.
yarn run start
```


## Endpoints:

Refer to http://0.0.0.0:3000/api-docs to see the swagger documentation for the server


## TODO:

[] work on Iota Api connector
  [] checkSplitPaymentStatus
  [] handlePayment
  [] checkPaymentStatus

[] set up and start writing unit tests!
[] set up and write integration tests
[] deploy development environment - maybe on Heroku?
[] set up CI for development environment (travis?)


Don't know how important these are for initial version:
[] integrate 3rd party user login and auth (maybe Firebase)
[] define and implement ApiKey