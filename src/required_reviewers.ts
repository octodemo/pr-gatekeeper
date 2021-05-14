import * as core from '@actions/core'

export type Settings = {
  required_reviewers: string[]
}

export class RequiredReviewers {
  constructor(private settings: Settings) { }
  getReviewers(): string[] {
    let required_reviewers: string[] = []
    if (this.settings) {
      required_reviewers = this.settings.required_reviewers
      core.debug(`Required reviewers: ${required_reviewers}`)
    }
    return required_reviewers
  }
}
