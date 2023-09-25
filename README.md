# connect-search-template
This repository provides a template of search connector used in [connect service](https://github.com/commercetools/connect-services), which helps users to customize their own connector application to synchronize product changes between specific store in the Commercetools project and external search index.

## Features
- NodeJS supported.
- Uses Express as web server framework.
- Uses Commercetools SDK for the Commercetools-specific communication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.
- Uses JSON formatted logger with log levels
- Setup sample integration tests with [Jest](https://jestjs.io/) and [supertest](https://github.com/ladjs/supertest#readme)

##Getting started
The template contains two separated modules :
- Full Ingestion : Provides a REST-API to users to export all products from specific store of a Commercetools project to external search index. 
- Incremental Updater : Receives message from GCP Pub/Sub once there are product changes in Commercetools store. The modified products are then synchronized to the existing external search index.

Regarding the development of both modules, please refer to the following documetations:
- Development of Full Ingestion
- Development of Incremental Updater

##Deployment Configuration
In order to deploy your customized search connector application on commercetools provided infrastructure, it needs to reviewed by certification team. For details, please refer to [documentation about Commercetools Connect](https://docs.commercetools.com/connect/concepts)
In addition, in order to support connect service, the search connector template has a folder structure as listed below
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

Connect deployment configuration is specified in `connect.yaml` which is required information needed for certification of the application. Following is the deployment configuration used by full ingestion and incremental updater modules
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
          description: Commercetools project key
        - key: CTP_CLIENT_ID
          description: Commercetools client ID
        - key: CTP_CLIENT_SECRET
          description: Commercetools client secreet
        - key: CTP_SCOPE
          description: Commercetools client scope
        - key: CTP_REGION
          description: Region of Commercetools project
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
          description: Unique key of Commercetools Store
        - key: CTP_PROJECT_KEY
          description: Commercetools project key
        - key: CTP_CLIENT_ID
          description: Commercetools client ID
        - key: CTP_CLIENT_SECRET
          description: Commercetools client secreet
        - key: CTP_SCOPE
          description: Commercetools client scope
        - key: CTP_REGION
          description: Region of Commercetools project
        - key: SEARCH_PLATFORM_CONFIG
          description: Escaped JSON object including credentails to search platform and other settings
```

Here you can see the details about various variables in configuration
- CTP_PROJECT_KEY: The key of Commercetools project.
- CTP_CLIENT_ID: The client ID of your Commercetools user account. It is used in Commercetools client to communicate with Commercetools platform via SDK.
- CTP_CLIENT_SECRET: The client secret of Commercetools user account. It is used in Commercetools client to communicate with Commercetools platform via SDK.
- CTP_SCOPE: The scope constrains the endpoints to which the Commercetools client has access, as well as the read/write access right to an endpoint.
- CTP_REGION: As the Composable Commerce API is provided in six different region, it defines the region which your Commercetools user account belongs to.
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
- CTP_STORE_KEY : Only used in incremental updater. It specifies the key of Commercetools store so that connector can look up the modified product under the specific store in commercetools platform.

