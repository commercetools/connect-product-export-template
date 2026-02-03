import {
  optional,
  standardString,
  standardKey,
  region,
} from './helpers.validators.js';

/**
 * Create here your own validators
 */
const validDestinations = (path, message) => [
  path,
  [
    [
      (value) => value === undefined || value === null || ['GCP', 'SNS'].includes(value),
      message,
    ],
  ],
];

const envValidators = [
  standardString(
    ['clientId'],
    {
      code: 'InValidClientId',
      message: 'Client id should be 24 characters.',
      referencedBy: 'environmentVariables',
    },
    { min: 24, max: 24 }
  ),

  standardString(
    ['clientSecret'],
    {
      code: 'InvalidClientSecret',
      message: 'Client secret should be 32 characters.',
      referencedBy: 'environmentVariables',
    },
    { min: 32, max: 32 }
  ),

  standardKey(['projectKey'], {
    code: 'InvalidProjectKey',
    message: 'Project key should be a valid string.',
    referencedBy: 'environmentVariables',
  }),

  optional(standardString)(
    ['scope'],
    {
      code: 'InvalidScope',
      message: 'Scope should be at least 2 characters long.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),

  region(['region'], {
    code: 'InvalidRegion',
    message: 'Not a valid region.',
    referencedBy: 'environmentVariables',
  }),

  standardString(
    ['connectSubscriptionDestination'],
    {
      code: 'InvalidSubscriptionDestination',
      message: 'Subscription destination is required.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: 10 }
  ),

  validDestinations(['connectSubscriptionDestination'], {
    code: 'InvalidSubscriptionDestination',
    message: "Subscription destination must be either 'GCP' or 'SNS'.",
    referencedBy: 'environmentVariables',
  }),

  optional(standardString)(
    ['connectGcpTopicName'],
    {
      code: 'InvalidGcpTopicName',
      message: 'GCP topic name should be a valid string.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),

  optional(standardString)(
    ['connectGcpProjectId'],
    {
      code: 'InvalidGcpProjectId',
      message: 'GCP project ID should be a valid string.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),

  optional(standardString)(
    ['connectAwsTopicArn'],
    {
      code: 'InvalidAwsTopicArn',
      message: 'AWS topic ARN should be a valid string.',
      referencedBy: 'environmentVariables',
    },
    { min: 2, max: undefined }
  ),
];

export default envValidators;
