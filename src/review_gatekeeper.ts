export interface Settings {
  approvals: {
    minimum?: number
    groups?: {
      minimum?: number
      name: string
      from: string[]
    }[]
  }
}

function set_equal<T>(as: Set<T>, bs: Set<T>): boolean {
  if (as.size !== bs.size) {
    return false
  }
  for (const a of as) {
    if (!bs.has(a)) {
      return false
    }
  }
  return true
}

function set_intersect<T>(as: Set<T>, bs: Set<T>): Set<T> {
  return new Set([...as].filter(e => bs.has(e)))
}

function set_to_string<T>(as: Set<T>): string {
  return [...as].join(', ')
}

export class ReviewGatekeeper {
  private messages: string[]
  private meet_criteria: boolean

  constructor(settings: Settings, approved_users: string[], pr_owner: string) {
    this.messages = []
    this.meet_criteria = true

    const approvals = settings.approvals
    // check if the minimum criteria is met.
    if (approvals.minimum) {
      if (approvals.minimum > approved_users.length) {
        this.meet_criteria = false
        this.messages.push(
          `${approvals.minimum} reviewers should approve this PR (currently: ${approved_users.length})`
        )
      }
    }

    // check if the groups criteria is met.
    const approved = new Set(approved_users)
    if (approvals.groups) {
      for (const group of approvals.groups) {
        const required_users = new Set(group.from)
        // Remove PR owner from required uesrs because PR owner cannot approve their own PR.
        required_users.delete(pr_owner)
        const approved_from_this_group = set_intersect(required_users, approved)
        const minimum_of_group = group.minimum
        if (minimum_of_group) {
          if (minimum_of_group > approved_from_this_group.size) {
            this.meet_criteria = false
            this.messages.push(
              `${minimum_of_group} reviewers from the group '${
                group.name
              }' (${set_to_string(
                required_users
              )}) should approve this PR (currently: ${
                approved_from_this_group.size
              })`
            )
          }
        } else {
          // If no `minimum` option is specified, approval from all is required.
          if (!set_equal(approved_from_this_group, required_users)) {
            this.meet_criteria = false
            this.messages.push(
              `All of the reviewers from the group '${
                group.name
              }' (${set_to_string(required_users)}) should approve this PR`
            )
          }
        }
      }
    }
  }

  satisfy(): boolean {
    return this.meet_criteria
  }

  getMessages(): string[] {
    return this.messages
  }
}
