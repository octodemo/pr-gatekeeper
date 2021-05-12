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
    core.debug(`Required reviewers: ${required_reviewers}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
