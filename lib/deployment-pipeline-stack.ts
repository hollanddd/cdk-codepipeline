import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as pipeline from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';

export class DeploymentPipelineStack extends cdk.Stack {
  constructor(app: cdk.App, id: string, props?: cdk.StackProps) {
    super(app, id, props);

    // A code pipeline consists a source (github|codecommit|s3) and one or more
    // codebuild pipeline projects

    // A build project configures build commands and execution environment
    const buildProject = new codebuild.PipelineProject(this, 'BuildPipeline', {
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: 'make install',
          },
          build: {
            comands: 'make build',
          },
          artifacts: {
            'base-directory': '$CODEBUILD_SRC_DIR/dist',
            files: ['./*'],
          },
        },
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_2_0,
      },
    });

    const sourceOutput = new pipeline.Artifact();
    const buildOutput = new pipeline.Artifact('BuildOutput');

    new pipeline.Pipeline(this, 'Pipeline', {
      stages: [
        {
          stageName: 'Source',
          actions: [
            new actions.GitHubSourceAction({
              actionName: 'Source',
              output: sourceOutput,
              owner: this.node.tryGetContext('owner'),
              repo: this.node.tryGetContext('repo'),
              branch: this.node.tryGetContext('branch'),
              oauthToken: cdk.SecretValue.secretsManager('github'),
            }),
          ],
        },
        {
          stageName: 'Build',
          actions: [
            new actions.CodeBuildAction({
              actionName: 'Build',
              project: buildProject,
              input: sourceOutput,
              outputs: [buildOutput], 
            }),
          ],
        },
      ],
    });
  }
}
