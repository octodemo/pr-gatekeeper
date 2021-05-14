import {Settings, RequiredReviewers} from '../src/required_reviewers'

test('required reviewers matching', async () => {
  const settings: Settings = {
    required_reviewers: ['user1', 'user2']
  }

  expect(new RequiredReviewers(settings).getReviewers().sort()).toEqual(
    ['user1', 'user2'].sort()
  )
})
