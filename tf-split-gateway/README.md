
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

[] start writing tests!
[] deploy development environment - maybe on Heroku?
[] set up CI for development environment (travis?)
[] integrate 3rd party user login and auth (maybe Firebase)
[] define and implement ApiKey