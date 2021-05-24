[![test](https://github.com/octodemo/review-approval-action/actions/workflows/test.yml/badge.svg)](https://github.com/octodemo/review-approval-action/actions/workflows/test.yml)

# Review Approval Action

This is an action created for the 2021 INTL FS Hackathon where we decided to reimplement [Zappr](https://zappr.opensource.zalan.do/login) in the form of a GitHub Action that will perform the required checks for complex pull request approval cases that are not currently supported by the [protected branches](https://docs.github.com/en/github/administering-a-repository/defining-the-mergeability-of-pull-requests/about-protected-branches#about-branch-protection-settings) feature in GitHub.

## Configuration

The action is configured via the `approve_config.yml` file located in the `.github` subdirectory. The general format is as follows.

```yaml
approvals:
  # check will fail if there is no approval
  minimum: 1
  groups:
    # check will fail if there is not at least 1 approval
    # from backend persons
    backend:
      minimum: 1
      from:
        users:
          - yuichielectric
          - dchomh
    # check will fail if there is not at least 2 approval
    # from frontend persons
    frontend:
      minimum: 2
      from:
        users:
          - dchomh
          - rerwinx

```

Once the `approve_config.yml` file is in place, add the action to execute on every PR and then set it as a required action to start enforcing your new approval policy!

```yaml
name: 'Review Gatekeeper'

on:
  pull_request:
    types: [assigned, unassigned, opened, reopened, synchronize, review_requested, review_request_removed]
  pull_request_review:

jobs:
  review-gatekeeper:
    name: Review Gatekeeper
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: octodemo/review-approval-action@main
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## TODO for future

- Add a way to specify reviewers by GitHub team.
- Add Dismiss stale pull request approvals when new commits are pushed equivalent option.
- Ignore PR owner's review
- Publish at GitHub Marketplace
