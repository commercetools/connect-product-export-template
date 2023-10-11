# connect-search-ingestion-template
This repository provides a [connect](https://docs.commercetools.com/connect) template for a search ingestion connector for populating a Store-specific external search engine. This boilerplate code acts as a starting point for such integration.

This template uses the [Store](https://docs.commercetools.com/api/projects/stores) and [Product Selection](https://docs.commercetools.com/api/projects/product-selections) data models from commercetools composable commerce which can be used for querying Store-specific product data to power Store-specific frontends. Template is based on asynchronous [Subscriptions](https://docs.commercetools.com/api/projects/subscriptions) to keep the search indices up to date.

## Template Features
- NodeJS supported.
- Uses Express as web server framework.
- Uses [commercetools SDK](https://docs.commercetools.com/sdk/js-sdk-getting-started) for the commercetools-specific communication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.
- Uses JSON formatted logger with log levels
- Setup sample integration tests with [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest#readme)

## Prerequisite
#### 1. commercetools composable commerce API client
Users are expected to create API client responsible for fetching product, store and product selection details from composable commerce project, API client should have enought scope to be able to do so. These API client details are taken as input as an environment variable/ configuration for connect. Details of compsable commerce project can be provided as environment variables (configuration for connect) `CTP_PROJECT_KEY` , `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`, `CTP_SCOPE`, `CTP_REGION`. For details, please read [Deployment Configuration](./README.md#Deployment Configuration).

#### 2. commercetools composable commerce Data setup
Users are expected to create store and link product selection, accordingly linking products to corresponding product selection. The Store detail is taken as input as an environment variable / configuration for connect. Details of store can be provided as environment variables (configuration for connect) `CTP_STORE_KEY`. For details, please read [Deployment Configuration](./README.md#Deployment Configuration).

#### 3. external search index creation
Users are expected to create search index in external search engine . The index details are taken as input as an environment variable / configuration for connect. Details of search index can be provided as environment variables (configuration for connect) `SEARCH_PLATFORM_CONFIG`.For details, please read [Deployment Configuration](./README.md#Deployment Configuration).

 
## Getting started
The template contains two separated modules :
- Full Ingestion : Provides a REST-API to users to export all products from specific store of a commercetools project to external search index as initial load or  for full reindexing whenever needed. 
- Incremental Updater : Receives message from commercetools project once there are product changes in commercetools store. The modified products are then synchronized to the existing external search index.

Regarding the development of both modules, please refer to the following documetations:
- Development of Full Ingestion
- Development of Incremental Updater

#### 1. Develop your search-specific needs 
To import the [commercetools composable commerce Product Projections](https://docs.commercetools.com/api/projects/productProjections) to external search index, users need to extend this connector with the following tasks
- Data Mapping: Implementaion to transform the product projection objects from commercetools structure to users-desired structure for the search index.
- Data Persistence: Implementation to save/remove product data to the specific search index using libraries provided by external search product. Please remember that the product data might not be saved into the external search index in a single attempt, it should have needed retry and recovery mechanism.

#### 2. Register as connector in commercetools Connect
Follow guidelines [here](https://docs.commercetools.com/connect/getting-started) to register the connector for public/private use.


## Deployment Configuration
In order to deploy your customized search connector application on commercetools Connect, it needs be published. For details, please refer to [documentation about commercetools Connect](https://docs.commercetools.com/connect/concepts)
In addition, in order to support connect, the search connector template has a folder structure as listed below
```
├── full-ingestion
│   ├── src
│   ├── test
│   └── package.json
├── incremental-updater
│   ├── src
│   ├── test
│   └── package.json
└── connect.yaml
```

Connect deployment configuration is specified in `connect.yaml` which is required information needed for publishing of the application. Following is the deployment configuration used by full ingestion and incremental updater modules
```
deployAs:
  - name: full-ingestion
    applicationType: service
    endpoint: /fullSync
    scripts:
      postDeploy: npm install
    configuration:
      securedConfiguration:
        - key: CTP_PROJECT_KEY
          description: commercetools project key
        - key: CTP_CLIENT_ID
          description: commercetools client ID
        - key: CTP_CLIENT_SECRET
          description: commercetools client secreet
        - key: CTP_SCOPE
          description: commercetools client scope
        - key: CTP_REGION
          description: Region of commercetools project
        - key: SEARCH_PLATFORM_CONFIG
          description: Escaped JSON object including credentails to search platform and other settings
  - name: incremental-updater
    applicationType: event
    endpoint: /deltaSync
    scripts:
      postDeploy: npm install && npm run connector:post-deploy
      preUndeploy: npm install && npm run connector:pre-undeploy
    configuration:
      securedConfiguration:
        - key: CTP_STORE_KEY
          description: Unique key of commercetools Store
        - key: CTP_PROJECT_KEY
          description: commercetools project key
        - key: CTP_CLIENT_ID
          description: commercetools client ID
        - key: CTP_CLIENT_SECRET
          description: commercetools client secreet
        - key: CTP_SCOPE
          description: commercetools client scope
        - key: CTP_REGION
          description: Region of commercetools project
        - key: SEARCH_PLATFORM_CONFIG
          description: Escaped JSON object including credentails to search platform and other settings
```

Here you can see the details about various variables in configuration
- CTP_PROJECT_KEY: The key of commercetools project.
- CTP_CLIENT_ID: The client ID of your commercetools user account. It is used in commercetools client to communicate with commercetools platform via SDK.
- CTP_CLIENT_SECRET: The client secret of commercetools user account. It is used in commercetools client to communicate with commercetools platform via SDK.
- CTP_SCOPE: The scope constrains the endpoints to which the commercetools client has access, as well as the read/write access right to an endpoint.
- CTP_REGION: As the commercetools APIs are provided in six different region, it defines the region which your commercetools user account belongs to.
- SEARCH_PLATFORM_CONFIG: It defines the configurations required by the external search index, such as credentials, search index unique identifier, etc.
  Following is a sample JSON object of this variable.
  
    ```
    {
        SEARCH_INDEX_CREDENTIAL_ID: xxx,
        SEARCH_INDEX_CREDENTIAL_SECRET: yyy,
        SEARCH_INDEX_ID: zzz
    }

    ```
  The value of this configuration variable needs to be in escaped JSON format. Hence, based on the sample above, the expected value of this variable becomes
  ```
  '{ "SEARCH_INDEX_CREDENTIAL_ID": "xxx", "SEARCH_INDEX_CREDENTIAL_SECRET": "yyy", "SEARCH_INDEX_ID": "zzz" }'
  ```
- CTP_STORE_KEY : Only used in incremental updater. It specifies the key of commercetools store so that connector can look up the modified product under the specific store in commercetools platform.

## Recommendations
#### Implement your own test cases
We have provided simple integration test cases with [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest#readme). The implementation is under `test` folder in both `full-ingestion` and `incremental-updater` modules. It is recommended to implement further test cases based on your own needs to test your development. 
