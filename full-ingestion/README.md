# Full Ingestion
This module provides a REST-API hosted on Commercetools-provided infrastructure. Once the API is triggered, it exports all products under the specific store of the Commercetools project, and then import to the external search index.

## Assumption

## Get started
### Install your search-specific SDK 
Assuming you have already published your developed SDK as a package to the npm registry, please run following npm command under full-ingestion folder to install the package.
```
$ npm install <your-search-index-sdk>
```

### Install dependencies
```
$ npm install
```

### Run integration test
```
$ npm run test:integration
```

### Run the application in local environment
```
$ npm run start
```

### Execute full synchronization
After deployment by connect service or starting up the application in local environment, you can trigger the full synchronization by sending HTTP POST request to REST-API as below
```
curl 
--location 
--request POST 'https://<your-search-connector-host>/fullSync/<your-commercetools-store-key>' \
--data ''

```
Remind that you need to change the host name and append the Commercetools store key as query parameter in the URL.
