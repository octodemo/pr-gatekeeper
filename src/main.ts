import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks-types'
import * as fs from 'fs'
import * as YAML from 'yaml'
import {EOL} from 'os'
import {Settings, ReviewGatekeeper} from './review_gatekeeper'

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

    const review_gatekeeper = new ReviewGatekeeper(
      config_file_contents as Settings,
      Array.from(approved_users),
      payload.pull_request.user.login
    )

    const sha = payload.pull_request.head.sha
    // The workflow url can be obtained by combining several environment varialbes, as described below:
    // https://docs.github.com/en/actions/reference/environment-variables#default-environment-variables
    const workflow_url = `${process.env['GITHUB_SERVER_URL']}/${process.env['GITHUB_REPOSITORY']}/actions/runs/${process.env['GITHUB_RUN_ID']}`
    core.info(`Setting a status on commit (${sha})`)

    octokit.rest.repos.createCommitStatus({
      ...context.repo,
      sha,
      state: review_gatekeeper.satisfy() ? 'success' : 'failure',
      context: 'PR Gatekeeper Status',
      target_url: workflow_url,
      description: review_gatekeeper.satisfy()
        ? undefined
        : review_gatekeeper.getMessages().join(' ').substr(0, 140)
    })

    if (!review_gatekeeper.satisfy()) {
      core.setFailed(review_gatekeeper.getMessages().join(EOL))
      return
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
