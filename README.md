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