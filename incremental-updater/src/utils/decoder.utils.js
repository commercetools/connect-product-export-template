const decodeToString = (encodedMessageBody) => {
  const buff = new Buffer(encodedMessageBody, 'base64');
  return buff.toString().trim();
};

export const decodeToJson = (encodedMessageBody) => {
  const decodedString = decodeToString(encodedMessageBody);
  return JSON.parse(decodedString);
};
