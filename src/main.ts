import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks-types'
import * as fs from 'fs'
import * as YAML from 'yaml'
import {Settings, ReviewGatekeeper} from './required_reviewers'

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

    // Read values from config file if it exists
    const config_file = fs.readFileSync('./.github/approve_config.yml', 'utf8')

    // Parse contents of config file into variable
    const config_file_contents = YAML.parse(config_file)

    const token: string = core.getInput('token')
    const octokit = github.getOctokit(token)
    const reviews = await octokit.pulls.listReviews({
      ...context.repo,
      pull_number: payload.pull_request.number
    })
    const approved_users: Set<string> = new Set()
    for (const review of reviews.data) {
      if (review.state === `APPROVED`) {
        approved_users.add(review.user!.login)
      }
    }

    const review_policy = new ReviewGatekeeper(
      config_file_contents as Settings,
      Array.from(approved_users)
    )
    if (!review_policy.satisfy()) {
      core.setFailed('More reviews required')
      return
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
