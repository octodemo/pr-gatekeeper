[![test](https://github.com/octodemo/review-approval-action/actions/workflows/test.yml/badge.svg)](https://github.com/octodemo/review-approval-action/actions/workflows/test.yml)

# PR Gatekeeper

This action is a status check to validate if specific reviewers have provided approvals within your PR workflows. Repo owners/ admins can configure the following:
- The minimum no. of approvals needed 
- The various groups and it's members and minimum no. of approvals within each group
- _The action current supports only people and not GitHub teams_

## How this action works
This action is triggered every time some change is made to the pull request (see [workflow example](#Workflow-config])). It checks whether the review and approval status of the pull request meets the policy described in the [action's config](#Action-config), and sets the result to a commit status named "PR Gatekeeper Status".

![screenshot](./images/commit-status.png)
You can enforce the review policy described in [action's config](#Action-config) by setting this "PR Gatekeeper Status" as required in the protected branch settings.

## How does it work alongside my repo's Branch Protection Rules(BPR)
PR Gatekeeper works in tandem with Branch Protection Rules, and helps enforce more finer policy controls. 

Branch Protection rules checks if the configured number of people have approved the PR and if yes, returns a `pass` signal. In situations where approvals from a specific people across specific teams is needed, Branch Protection Rules are unable to enforce. This is a common enterprise usecase, where select changes need approvals from Security, Quality & Infra teams for auditory & compliance purposes.

## How do I configure this to work in tandem with the repo's Branch Protection Rules(BPR)
1. Ensure that "PR Gatekeeper Status" is a required status check in the Branch Protection settings.
2. Define either the PR Gatekeeper `minimum` approvals within the [action's config](#Action-config) or in BPR's 'Required number of approvals before merging' field
<img width="766" alt="image" src="https://user-images.githubusercontent.com/83639549/192690706-d6448d13-40c6-4dd8-9027-6b26572d7003.png">
3. If both of the above fields are defined, ensure that the PR Gatekeeper's minimum no. of approvals should be greater than or equal to the BPR's required no. of approvals

## Configuration
### Action config
The action is configured via the `approve_config.yml` file located in the `.github` subdirectory. The general format is as follows.
```yaml
approvals:
  # check will fail if there is no approval
  minimum: 1     # optional, leave blank or a value greater than or equal to the Branch Protection Rules `Required no. of approvals`
  groups:        # optional
    - name: frontend #This would be the first team or group of reviewers
      minimum: 1 # optional, leaving this blank would make the review optional for this group. Uncommon, but possible
      from:
        - octocat1 # Ensure the username has no @ prefix
        - octocat2 # currently, only usernames are supported, no team names
    - name: backend
      minimum: 2
      from:
        - octocat4
        - octocat5
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
      - uses: octodemo/pr-gatekeeper@v1.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

# A bit of History 
This is an action created for the 2021 INTL FS Hackathon where we decided to reimplement [Zappr](https://zappr.opensource.zalan.do/login) in the form of a GitHub Action that will perform the required checks for complex pull request approval cases that are not currently supported by the [protected branches](https://docs.github.com/en/github/administering-a-repository/defining-the-mergeability-of-pull-requests/about-protected-branches#about-branch-protection-settings) feature in GitHub.
