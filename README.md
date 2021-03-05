# CDK Deployment Pipeline W/ GitHub Source

This project use the AWS CDK to build an AWS CodePipeline sourced from a GitHub
Repository. The stack expects the repository to contain a `buildspec.yml` at the
root of the directory.

The stack requires the following parameters:
- `RepositoryOwnerName` - repository owner
- `RepositoryName` - repository name
- `BranchName` - default `main`
- `GitHubTokenName` - [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/manage_create-basic-secret.html) name of [GitHub personal token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)

## example deployment

```bash
cdk deploy --parameters RepositoryName=some-repo \
  --parameters RepositoryName=some-repo          \
  --parameters RepositoryOwnerName=some-owner    \
  --parameters BranchName=main                   \
  --parameters GitHubTokenName=secret-name       \
```
