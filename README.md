[![test](https://github.com/octodemo/review-approval-action/actions/workflows/test.yml/badge.svg)](https://github.com/octodemo/review-approval-action/actions/workflows/test.yml)

# PR Gatekeeper

This is an action created for the 2021 INTL FS Hackathon where we decided to reimplement [Zappr](https://zappr.opensource.zalan.do/login) in the form of a GitHub Action that will perform the required checks for complex pull request approval cases that are not currently supported by the [protected branches](https://docs.github.com/en/github/administering-a-repository/defining-the-mergeability-of-pull-requests/about-protected-branches#about-branch-protection-settings) feature in GitHub.

## How this action works

This action is intended to be executed every time some change is made to the pull request (see [workflow example](#Workflow-config])). When this action is executed, it checks whether the review and approval status of the triggered pull request meets the policy described in the [action's config](#Action-config), and sets the result to a commit status named "PR Gatekeeper Status".

![screenshot](./images/commit-status.png)

You can enforce the review policy described in action config by setting this "PR Gatekeeper Status" as required in the protected branch settings.

## Configuration

### Action config

The action is configured via the `approve_config.yml` file located in the `.github` subdirectory. The general format is as follows.

```yaml
approvals:
  # check will fail if there is no approval
  minimum: 1     # optional
  groups:        # optional
    - name: frontend
      minimum: 1 # optional
      from:
        - yuichielectric
        - dchomh
    - name: backend
      minimum: 2
      from:
        - dchomh
        - rerwinx
```

### Workflow config

Once the `approve_config.yml` file is in place, add the action to execute on every PR and then set it as a required action to start enforcing your new approval policy!

```yaml
name: 'PR Gatekeeper'

on:
  pull_request:
    types:
      [
        assigned,
        unassigned,
        opened,
        reopened,
        synchronize,
        review_requested,
        review_request_removed
      ]
  pull_request_review:

jobs:
  pr-gatekeeper:
    name: PR Gatekeeper
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: octodemo/pr-gatekeeper@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## TODO for future

- Add a way to specify reviewers by GitHub team.
- Add Dismiss stale pull request approvals when new commits are pushed equivalent option.
