import { GitHubSourceAction, CodeBuildAction, CodeBuildActionType } from "@aws-cdk/aws-codepipeline-actions"
import { CfnParameter, Construct, SecretValue, Stack } from "@aws-cdk/core"
import { PipelineProject, LinuxBuildImage } from "@aws-cdk/aws-codebuild"
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline"

export class CIStack extends Stack {
  constructor(scope: Construct, name: string) {
    super(scope, name)

    // Accept GitHub repository details as cloud formation prarameters
    // see cdk deploy --help for more details
    const repositoryName = new CfnParameter(this, "RepositoryName", {
      description: "Name of repository that is being watched",
    });

    const repositoryOwner = new CfnParameter(this, "RepositoryOwnerName", {
      description: "Name of the GitHub repository owner",
    });

    const repositoryBranchName = new CfnParameter(this, "RepositoryBranchName", {
      description: "Name of the repository branch to monitory",
      default: "main",
    });

    // githubTokenName retrieves an secret value from AWS Secrets Manager. See
    // for information on creating secrets:
    // https://docs.aws.amazon.com/secretsmanager/latest/userguide/manage_create-basic-secret.html
    const githubTokenName = new CfnParameter(this, "GitHubTokenName", {
      description: "Name of GitHub token stored in secrets vault",
    });

    // sourceOutput is the artifiact object representing a repository in GitHub
    const sourceOutput = new Artifact("SourceOutput");

    // sourceAction configures AWS CodePipeline to use GitHub as a source.
    // GitHub requires that a personal access token is configured:
    // https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
    const sourceAction = new GitHubSourceAction({
      actionName: "Source",
      repo:       repositoryName.valueAsString,
      owner:      repositoryOwner.valueAsString,
      branch:     repositoryBranchName.valueAsString,
      oauthToken: SecretValue.secretsManager(githubTokenName.valueAsString),
      output:     sourceOutput,
    });

    // buildAction accepts the output from the source action and runs the
    // commands found in the buildSpec
    // https://docs.aws.amazon.com/codebuild/latest/userguide/sample-runtime-versions.html
    const buildAction = new CodeBuildAction({
      type: CodeBuildActionType.BUILD,
      actionName: "Build",
      project: new PipelineProject(this, "BuildStepPipelineProject", {
        projectName: "Build",
        environment: {
          buildImage: LinuxBuildImage.STANDARD_1_0,
        },
      }),
      input: sourceOutput,
    });

    // pipeline orchestrates one or more build stages.
    const pipeline = new Pipeline(this, "Pipeline", {})

    // pipelines are initialized by a source action
    pipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    // additional stages are added to the pipeline to coordinate actions
    pipeline.addStage({
      stageName: "PreDeploy",
      actions: [buildAction],
    });

    // TODO: add deployment stage
    // TODO: add integration tests
  }
}
