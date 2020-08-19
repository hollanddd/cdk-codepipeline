# CDK TypeScript Deployment Pipeline

This project builds an AWS CodePipeline with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute the app.

The stack relies on receiving the GitHub owner, repo, and branch from the CDK
context.  Use `cdk synth -c owner=github-user -c  repo=name -c branch=main` or
add the following to `cdk.json`:

```json
{
  "context": {
    "owner": "github-user",
    "repo":  "repo-name"
    "branch" "main"
  }
}
```

## Useful commands

- `npm run build`   compile typescript to js
- `npm run watch`   watch for changes and compile
- `npm run test`    perform the jest unit tests
- `cdk deploy`      deploy this stack to your default AWS account/region
- `cdk diff`        compare deployed stack with current state
- `cdk synth`       emits the synthesized CloudFormation template
