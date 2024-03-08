# Incremental Updater
This module provides an application hosted on commercetools-provided infrastructure, which receives messages from Google Cloud Pub/Sub when product changes under specific [commercetools Store](https://docs.commercetools.com/api/projects/stores) occur. 

The module also provides scripts for post-deployment and pre-undeployment action. After deployment via connect service completed, [commercetools Subscription](https://docs.commercetools.com/api/projects/subscriptions) is created by post-deployment script which listen to any product changes under specific store.
Once products in the store have been changed, the commercetools Subscription sends message to Google Cloud Pub/Sub topic and then notify the incremental updater to handle the corresponding product changes.

The commercetools Subscription would be cleared once the search connector is undeployed.

## Assumption
#### Support single store
Since search index in external platform is supposed to be store-specific, each deployed search connector handles product changes from single commercetools Store. The key of commercetools Store has to be defined as environment variable before deployment.

For details how to set environment variables for search connector in non-local environment, please refer to [Deployment Configuration](../README.md#Deployment Configuration).  
## Get started
#### Change the key of commercetools Subscription
Please specify your desired key for creation of commercetools Subscription [here](https://github.com/commercetools/connect-product-export-template/blob/c4f1a3e04988a4a44842d3e1607638c96983ef29/incremental-updater/src/connectors/actions.js#L1).
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
#### Run post-deploy script in local environment
```
$ npm run connector:post-deploy
```
#### Run pre-undeploy script in local environment
```
$ npm run connector:pre-undeploy
```

## Development in local environment
Different from staging and production environments, in which the out-of-the-box settings and variables have been set by connect service during deployment, the search connector requires additional operations in local environment for development.
#### Create Google Cloud pub/sub topic and subscription
When an event-type connector application is deployed via connect service, a GCP pub/sub topic and subscription are created automatically. However it does not apply on local environment. To develop the search connector in local environment, you need to follow the steps below:
1. Create a Pub/Sub topic and subscription in Google Cloud platform.
2. Use HTTP tunnel tools like [ngrok](https://ngrok.com/docs/getting-started) to expose your local development server to internet.
3. Set the URL provided by the tunnel tool as the destination of GCP subscription, so that message can be forwarded to the incremental updater in your local environment.  

For details, please refer to the [Overview of the GCP Pub/Sub service](https://cloud.google.com/pubsub/docs/pubsub-basics).

#### Set the required environment variables

Before starting the development, we advise users to create a .env file in order to help them in local development.
      
For that, we also have a template file .env.example with the required environement variables for the project to run successfuly. To make it work, rename the file from `.env.example` to `.env`. Remember to fill the variables with your values.

In addition, following two environment variables in `.env.example` are not needed to be provided by users during staging or production deployment. 
```
CONNECT_GCP_TOPIC_NAME=<your-gcp-topic-name>
CONNECT_GCP_PROJECT_ID=<your-gcp-project-id>
```
It is because they are only required in local development server. For staging or production environment, connect service sets the Pub/Sub topic name and GCP project ID into these environment variables automatically after the Pub/Sub service has been created in Google Cloud platform.

   

      
