# Incremental Updater
This module provides an application hosted on Commercetools-provided infrastructure, which receives messages from Google Cloud Pub/Sub when product changes under specific [Commercetools Store](https://docs.commercetools.com/api/projects/stores) occur. 

The module also provides scripts for post-deployment and pre-undeployment action. After deployment via connect service completed, [Commercetools Subscription](https://docs.commercetools.com/api/projects/subscriptions) is created by post-deployment script which listen to any product changes under specific store.
Once products in the store have been changed, the Commercetools Subscription sends message to Google Cloud Pub/Sub topic and then notify the incremental updater to handle the corresponding product changes.

The Commercetools Subscription would be cleared once the search connector is undeployed.

## Assumption
#### Support single store
Since search index in external platform is supposed to be store-specific, each deployed search connector handles product changes from single Commercetools Store. The key of Commercetools Store has to be defined as environment variable before deployment.

For details how to set environment variables for search connector in non-local environment, please refer to [Deployment Configuration](../README.md#Deployment Configuration).  
## Get started
#### Install your search-specific SDK 
Assuming you have already published your developed SDK as a package to the npm registry, please run following npm command under incremental-updater folder to install the package.
```
$ npm install <your-search-index-sdk>
```

#### Install dependencies
```
$ npm install
```
#### Run integration test
```
$ npm run test:integration
```
#### Run the application in local environment
```
$ npm run start
```
#### Change the key of Commercetools Subscription
Please specify your desired key for creation of Commercetools Subscription [here](https://github.com/commercetools/connect-search-ingestion-template/blob/c4f1a3e04988a4a44842d3e1607638c96983ef29/incremental-updater/src/connectors/actions.js#L1).

## Development in local environment
Different from staging and production environments, in which the out-of-the-box settings and variables have been set by connect service during deployment, the search connector requires additional operations in local environment for development.
#### Create Google Cloud pub/sub topic and subscription
When an event-type connector application is deployed via connect service, a GCP pub/sub topic and subscription are created automatically. However it does not apply on local environment. To develop the search connector in local environment, you need to follow the steps below:
1. Create a Pub/Sub topic and subscription in Google Cloud platform.
2. Use HTTP tunnel tools like [ngrok](https://ngrok.com/docs/getting-started) to expose your local development server to internet.
3. Set the URL provided by the tunnel tool as the destination of GCP subscription, so that message can be forwarded to the incremental updater in your local environment.  

For details, please refer to the [Overview of the GCP Pub/Sub service](https://cloud.google.com/pubsub/docs/pubsub-basics).

#### Set the required environment variables
After connect service created a Pub/Sub service in Google Cloud platform for staging and production deployment, connect service sets the Pub/Sub topic name and GCP project ID into environment variables. In contrast, you need to add them to environment variables in case of development in local server.
Please execute the commands in the console of your local server to do this
```
$ export CONNECT_GCP_TOPIC_NAME=<your-gcp-topic-name>
$ export CONNECT_GCP_PROJECT_ID=<your-gcp-project-id>
```   