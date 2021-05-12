import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks-types'

async function run(): Promise<void> {
  try {
    const context = github.context
    if (
      context.eventName !== 'pull_request' &&
      context.eventName !== 'pull_request_review'
    ) {
      core.setFailed(
        `Invalid event: ${context.eventName}. This action should be triggered on pull_request and pull_request_review`
      )
      return
    }
    const payload = context.payload as
      | Webhooks.PullRequestEvent
      | Webhooks.PullRequestReviewEvent

    const required_reviewers: string[] = core
      .getInput('required_reviewers')
      .split(',')
    core.debug(`Required reviewers: ${required_reviewers}`)

    const token: string = core.getInput('token')
    const octokit = github.getOctokit(token)
    const reviews = await octokit.pulls.listReviews({
      ...context.repo,
      pull_number: payload.pull_request.number
    })

    // Create a map of reviewers' state
    const userReviews = new Map<string, string>()
    for (const review of reviews.data) {
      userReviews.set(review.user!.login, review.state)
    }

    const need_review_by = []
    for (const required_reviewer of required_reviewers) {
      if (required_reviewer === payload.pull_request.user.login) {
        // Skip PR owner because PR owner cannot approve the PR.
        continue
      }
      if (
        !userReviews.has(required_reviewer) ||
        userReviews.get(required_reviewer) !== 'APPROVED'
      ) {
        need_review_by.push(required_reviewer)
      }
    }

    if (need_review_by.length > 0) {
      core.setFailed(`Review approval from ${need_review_by} is required`)
      return
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
