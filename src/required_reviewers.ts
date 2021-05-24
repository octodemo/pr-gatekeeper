export interface Settings {
  approvals: {
    minimum?: number
    groups?: {
      [key: string]: {
        minimum?: number
        from: {
          users: string[]
        }
      }
    }
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

export class RequiredReviewers {
  constructor(private settings: Settings, private approved_users: string[]) {}

  satisfy(): boolean {
    const approvals = this.settings.approvals

    // check if the minimum criteria is met.
    if (approvals.minimum) {
      if (approvals.minimum > this.approved_users.length) {
        return false
      }
    }

    // check if the groups criteria is met.
    const approved = new Set(this.approved_users)
    if (approvals.groups) {
      for (const group in approvals.groups) {
        const required_users = new Set(approvals.groups[group].from.users)
        const approved_from_this_group = set_intersect(required_users, approved)
        const minimum_of_group = approvals.groups[group].minimum
        if (minimum_of_group) {
          if (minimum_of_group > approved_from_this_group.size) {
            return false
          } else {
            // Go on to the next group.
            continue
          }
        } else {
          // If no `minimum` option is specified, approval from all is required.
          if (!set_equal(approved_from_this_group, required_users)) {
            return false
          } else {
            // Go on to the next group.
            continue
          }
        }
      }
    }
    return true
  }
}
