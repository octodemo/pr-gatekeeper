import * as core from '@actions/core'

export interface Settings {
  approvals: {
    minimum?: number
    groups: {
      [key: string]: {
        from: {
          users: string[]
        }
      }
    }
  }
}

export class RequiredReviewers {
  constructor(private settings: Settings) {}
  getReviewers(): string[] {
    const required_reviewers: Set<string> = new Set()
    if (this.settings) {
      const approvals = this.settings.approvals
      for (const group in approvals.groups) {
        for (const user of approvals.groups[group].from.users) {
          required_reviewers.add(user)
        }
      }
    }
    return Array.from(required_reviewers)
  }
}
