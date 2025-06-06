import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

export class MountainTrekkingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'MountainTrekkingUserPool', {
      userPoolName: 'mountain-trekking-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
    });

    // Cognito App Client
    const userPoolClient = new cognito.UserPoolClient(this, 'MountainTrekkingClient', {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE, cognito.OAuthScope.OPENID],
        callbackUrls: ['http://localhost:3000'], // Add your app URLs here
        logoutUrls: ['http://localhost:3000'],
      },
    });

    // DynamoDB Tables
    const eventsTable = new dynamodb.Table(this, 'EventsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN in production
    });

    const userProfilesTable = new dynamodb.Table(this, 'UserProfilesTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN in production
    });

    // Lambda Functions
    const eventsHandler = new lambda.Function(this, 'EventsHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/events'), // We'll create this later
      environment: {
        EVENTS_TABLE: eventsTable.tableName,
        USER_PROFILES_TABLE: userProfilesTable.tableName,
      },
    });

    // Grant permissions
    eventsTable.grantReadWriteData(eventsHandler);
    userProfilesTable.grantReadWriteData(eventsHandler);

    // API Gateway
    const api = new apigateway.RestApi(this, 'MountainTrekkingApi', {
      restApiName: 'Mountain Trekking API',
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'http://localhost:3000',
          'https://*.amplifyapp.com'
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['*'],
        allowCredentials: true,
      },
      deployOptions: {
        methodOptions: {
          '/*/*': {  // This special path applies to all resources and methods
            throttlingRateLimit: 10,
            throttlingBurstLimit: 5
          }
        }
      }
    });

    // Add Cognito Authorizer
    const auth = new apigateway.CognitoUserPoolsAuthorizer(this, 'MountainTrekkingAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // Create Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(eventsHandler, {
      proxy: true,
    });

    // Events resource
    const events = api.root.addResource('events');

    // Add methods
    events.addMethod('GET', lambdaIntegration, {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    events.addMethod('POST', lambdaIntegration, {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Single event resource
    const singleEvent = events.addResource('{id}');

    singleEvent.addMethod('GET', lambdaIntegration, {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    singleEvent.addMethod('PUT', lambdaIntegration, {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    singleEvent.addMethod('DELETE', lambdaIntegration, {
      authorizer: auth,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // Output values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
} 