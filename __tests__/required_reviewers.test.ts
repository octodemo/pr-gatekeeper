import {Settings, ReviewGatekeeper} from '../src/review_gatekeeper'

test('Top level minimum', async () => {
  const settings: Settings = {
    approvals: {
      minimum: 2
    }
  }

  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2']).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2', 'user3']).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user3', 'user4']).satisfy()[0]
  ).toBeTruthy()
  expect(new ReviewGatekeeper(settings, ['user1']).satisfy()[0]).toBeFalsy()
})

test('One group without minimum', async () => {
  const settings: Settings = {
    approvals: {
      groups: {
        group_a: {
          from: {
            users: ['user1', 'user2']
          }
        }
      }
    }
  }

  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2']).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2', 'user3']).satisfy()[0]
  ).toBeTruthy()
  expect(new ReviewGatekeeper(settings, ['user1']).satisfy()[0]).toBeFalsy()
})

test('Multiple groups without minimum', async () => {
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

  expect(
    new ReviewGatekeeper(settings, [
      'user1',
      'user2',
      'user3',
      'user4'
    ]).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, [
      'user1',
      'user2',
      'user3',
      'user4',
      'user5'
    ]).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2', 'user3']).satisfy()[0]
  ).toBeFalsy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2']).satisfy()[0]
  ).toBeFalsy()
})

test('One group with minimum', async () => {
  const settings: Settings = {
    approvals: {
      groups: {
        group_a: {
          minimum: 2,
          from: {
            users: ['user1', 'user2', 'user3']
          }
        }
      }
    }
  }

  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2']).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2', 'user3']).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2', 'user4']).satisfy()[0]
  ).toBeTruthy()
  expect(new ReviewGatekeeper(settings, ['user1']).satisfy()[0]).toBeFalsy()
})

test('Multiple groups with minimum', async () => {
  const settings: Settings = {
    approvals: {
      groups: {
        group_a: {
          minimum: 1,
          from: {
            users: ['user1', 'user2']
          }
        },
        group_b: {
          minimum: 2,
          from: {
            users: ['user3', 'user4', 'user2']
          }
        }
      }
    }
  }

  expect(
    new ReviewGatekeeper(settings, ['user1', 'user3', 'user4']).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2', 'user4']).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2', 'user3']).satisfy()[0]
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2']).satisfy()[0]
  ).toBeFalsy()
})
