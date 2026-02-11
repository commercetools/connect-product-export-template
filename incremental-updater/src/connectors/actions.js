import { assertNonNullable } from '../utils/assert.utils.js';

const STORE_PRODUCT_CHANGE_SUBSCRIPTION_KEY =
  'ct-connect-product-ingestion-subscription';

export async function deleteChangedStoreSubscription(apiRoot) {
  const {
    body: { results: subscriptions },
  } = await apiRoot
    .subscriptions()
    .get({
      queryArgs: {
        where: `key = "${STORE_PRODUCT_CHANGE_SUBSCRIPTION_KEY}"`,
      },
    })
    .execute();

  if (subscriptions.length > 0) {
    const subscription = subscriptions[0];

    await apiRoot
      .subscriptions()
      .withKey({ key: STORE_PRODUCT_CHANGE_SUBSCRIPTION_KEY })
      .delete({
        queryArgs: {
          version: subscription.version,
        },
      })
      .execute();
  }
}

function buildDestination(config) {
  assertNonNullable(
    config.connectSubscriptionDestination,
    'CONNECT_SUBSCRIPTION_DESTINATION is required'
  );

  switch (config.connectSubscriptionDestination) {
    case 'GoogleCloudPubSub':
      assertNonNullable(
        config.connectGcpTopicName,
        'CONNECT_GCP_TOPIC_NAME is required for GCP destination'
      );
      assertNonNullable(
        config.connectGcpProjectId,
        'CONNECT_GCP_PROJECT_ID is required for GCP destination'
      );
      return {
        type: 'GoogleCloudPubSub',
        topic: config.connectGcpTopicName,
        projectId: config.connectGcpProjectId,
      };
    case 'SNS':
      assertNonNullable(
        config.connectAwsTopicArn,
        'CONNECT_AWS_TOPIC_ARN is required for SNS destination'
      );
      return {
        type: 'SNS',
        topicArn: config.connectAwsTopicArn,
        authenticationMode: 'IAM',
      };
    default:
      throw new Error(
        `Unsupported subscription destination: ${config.connectSubscriptionDestination}. Valid options are 'GoogleCloudPubSub' or 'SNS'.`
      );
  }
}

export async function createSubscription(apiRoot, config) {
  await deleteChangedStoreSubscription(apiRoot);

  const destination = buildDestination(config);

  await apiRoot
    .subscriptions()
    .post({
      body: {
        key: STORE_PRODUCT_CHANGE_SUBSCRIPTION_KEY,
        destination,
        messages: [
          {
            resourceTypeId: 'product-selection',
            types: [
              'ProductSelectionProductAdded',
              'ProductSelectionProductRemoved',
              'ProductSelectionVariantSelectionChanged',
            ],
          },
          {
            resourceTypeId: 'store',
            types: [
              'StoreProductSelectionsChanged',
              'StoreCreated',
              'StoreDeleted',
            ],
          },
        ],
        changes: [
          {
            resourceTypeId: 'product',
          },
        ],
      },
    })
    .execute();
}
