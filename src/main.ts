import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks-types'
import * as fs from 'fs'
import * as YAML from 'yaml'
import {Settings, ReviewGatekeeper} from './review-gatekeeper'

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
    const config_file = fs.readFileSync(core.getInput('config-file'), 'utf8')

    // Parse contents of config file into variable
    const config_file_contents = YAML.parse(config_file)

    const token: string = core.getInput('token')
    const octokit = github.getOctokit(token)
    const reviews = await octokit.rest.pulls.listReviews({
      ...context.repo,
      pull_number: payload.pull_request.number
    })
    const approved_users: Set<string> = new Set()
    for (const review of reviews.data) {
      if (review.state === `APPROVED`) {
        approved_users.add(review.user!.login)
      }
    }

    core.debug(config_file_contents)
    core.debug(Array.from(approved_users).join(', '))

    const review_gatekeeper = new ReviewGatekeeper(
      config_file_contents as Settings,
      Array.from(approved_users),
      payload.pull_request.user.login
    )

    const sha = payload.pull_request.head.sha
    // The workflow url can be obtained by combining several environment varialbes, as described below:
    // https://docs.github.com/en/actions/reference/environment-variables#default-environment-variables
    core.info(`Setting a status on commit (${sha})`)

    octokit.rest.checks.create({
      ...context.repo,
      name: github.context.job,
      head_sha: sha,
      status: 'completed',
      conclusion: review_gatekeeper.satisfy() ? 'success' : 'failure',
      output: {
        title: 'PR Gatekeeper result',
        summary: '# Summary'
      }
    })

    if (!review_gatekeeper.satisfy()) {
      core.setFailed('# Summary')
      return
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
