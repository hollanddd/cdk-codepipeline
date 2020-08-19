#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { DeploymentPipelineStack } from '../lib/deployment-pipeline-stack';

const app = new cdk.App();
new DeploymentPipelineStack(app, 'DeploymentPipelineStack');
