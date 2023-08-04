export const eventHandler = async (request, response) => {
  // Receive the Pub/Sub message
  const pubSubMessage = request.body.message;

  const decodedData = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : undefined;

  if (decodedData) {
    // TODO : Synchronize change in commercetools platform to search engine.
    //     const jsonData = JSON.parse(decodedData);
  }

  // Return the response for the client
  response.status(204).send();
};
