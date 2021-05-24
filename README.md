<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Review Approval Action

This is an action created for the 2021 INTL FS Hackathon where we decided to reimplement [Zappr](https://zappr.opensource.zalan.do/login) in the form of a GitHub Action that will perform the required checks for complex pull request approval cases that are not currently supported by the [protected branches](https://docs.github.com/en/github/administering-a-repository/defining-the-mergeability-of-pull-requests/about-protected-branches#about-branch-protection-settings) feature in GitHub.

## Configuration

The action is configured via the `approve_config.yml` file located in the `.github` subdirectory. The general format is as follows.

```yaml
required_reviewers:
- <username>
```

We are currently working on adding a feature to specify groups in the `required_reviewers` section and to also specify the minimum number of users in that group that need to approve the PR before the action will pass.

Once the `approve_config.yml` file is in place, add the action to execute on every PR and then set it as a required action to start enforcing your new approval policy!

## TODO for future

We have not implemented the main logic that allows people to specify groups as required reviewers. In its current state, the action is equivalent to the feature that we provide in protected branches.
