
const CUSTOMER_CREATE_SUBSCRIPTION_KEY =
    'myconnector-customerCreateSubscription';

export async function createChangedStoreSubscription(
    apiRoot,
    topicName,
    projectId
) {
    console.log('###############')
    const {
        body: { results: subscriptions },
    } = await apiRoot
        .subscriptions()
        .get({
            queryArgs: {
                where: `key = "${CUSTOMER_CREATE_SUBSCRIPTION_KEY}"`,
            },
        })
        .execute();

    if (subscriptions.length > 0) {
        const subscription = subscriptions[0];

        await apiRoot
            .subscriptions()
            .withKey({ key: CUSTOMER_CREATE_SUBSCRIPTION_KEY })
            .delete({
                queryArgs: {
                    version: subscription.version,
                },
            })
            .execute();
    }
    console.log(topicName)
    console.log(projectId)
    await apiRoot
        .subscriptions()
        .post({
            body: {
                key: CUSTOMER_CREATE_SUBSCRIPTION_KEY,
                destination: {
                    type: 'GoogleCloudPubSub',
                    topic: topicName,
                    projectId,
                },
                changes : [
                    {
                        resourceTypeId: 'product'
                    },
                    {
                        resourceTypeId: 'product-selection'
                    },
                    {
                        resourceTypeId : 'store'
                    }
                ],
            },
        })
        .execute();
}