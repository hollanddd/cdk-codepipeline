import * as cdk from '@aws-cdk/core';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as pipeline from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';

export class DeploymentPipelineStack extends cdk.Stack {
  constructor(app: cdk.App, id: string, props?: cdk.StackProps) {
    super(app, id, props);

    // CloudFormation template parameters for the GitHub source repository
    const  repo = new cdk.CfnParameter(this, 'RepoName', {
      type: 'String',
      description: 'GitHub repository'
    });

    const branch = new cdk.CfnParameter(this, 'SourceBranch', {
      type: 'String',
      description: 'Source branch',
      default: 'main',
    });

    const owner = new cdk.CfnParameter(this, 'RepoOwner', {
      type: 'String',
      description: 'Repository Owner',
    });

    // A code pipeline consists of a source (github|codecommit|s3) and one or
    // more build projects

    // The buildSpec configures the phases and commands for the project
    // Use `.fromSourceFileName` to retrive from local file
    const buildSpec = codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        build: {
          comands: 'make',
        },
        artifacts: {
          'base-directory': '$CODEBUILD_SRC_DIR/build',
          files: ['./*'],
        },
      },
    });

    // A build project configures build commands and the execution environment
    const buildProject = new codebuild.PipelineProject(this, 'BuildPipeline', {
      buildSpec,
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
              owner: owner.valueAsString,
              repo: repo.valueAsString,
              branch: branch.valueAsString,
              oauthToken: cdk.SecretValue.secretsManager('GitHubPersonal'),
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
