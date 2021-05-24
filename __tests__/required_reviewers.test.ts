import {Settings, RequiredReviewers} from '../src/required_reviewers'

test('complex setting', async () => {
  const settings: Settings = {
    approvals: {
      groups: {
        group_a: {
          from: {
            users: ['user1', 'user2']
          }
        },
        group_b: {
          from: {
            users: ['user3', 'user4', 'user2']
          }
        }
      }
    }
  }

  expect(new RequiredReviewers(settings).getReviewers().sort()).toEqual(
    ['user1', 'user2', 'user3', 'user4'].sort()
  )
})
