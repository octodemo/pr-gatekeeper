import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  core.info('Starting...')
  try {
    if (
      github.context.eventName !== 'pull_request' &&
      github.context.eventName !== 'pull_request_review'
    ) {
      core.setFailed(
        `Invalid event: ${github.context.eventName}. This action should be triggered on pull_request and pull_request_review`
      )
      return
    }

    const required_reviewers: string[] = core
      .getInput('required_reviewers')
      .split(',')
    core.debug(`Required reviewers: ${required_reviewers}`)

    const token: string = core.getInput('token')
    const octokit = github.getOctokit(token)
    const reviews = await octokit.pulls.listReviews({
      ...github.context.repo,
      pull_number: github.context.payload.pull_request!.number
    })
    const userReviews = new Map<string, string>()
    for (const review of reviews.data) {
      userReviews.set(review.user!.login, review.state)
    }

    const need_review_by = []
    for (const required_reviewer of required_reviewers) {
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
