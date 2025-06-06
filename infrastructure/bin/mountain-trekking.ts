#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MountainTrekkingStack } from '../lib/mountain-trekking-stack';

const app = new cdk.App();
new MountainTrekkingStack(app, 'MountainTrekkingStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
}); 