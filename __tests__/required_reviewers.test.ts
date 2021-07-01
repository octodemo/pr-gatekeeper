import {Settings, ReviewGatekeeper} from '../src/review_gatekeeper'

test('Top level minimum', async () => {
  const settings: Settings = {
    approvals: {
      minimum: 2
    }
  }

  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2'], 'owner').satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user3'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user3', 'user4'], 'owner').satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1'], 'owner').satisfy()
  ).toBeFalsy()
})

test('One group without minimum', async () => {
  const settings: Settings = {
    approvals: {
      groups: [
        {
          name: 'group_a',
          from: ['user1', 'user2']
        }
      ]
    }
  }

  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2'], 'owner').satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user3'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1'], 'owner').satisfy()
  ).toBeFalsy()
})

test('Multiple groups without minimum', async () => {
  const settings: Settings = {
    approvals: {
      groups: [
        {
          name: 'group_a',
          from: ['user1', 'user2']
        },
        {
          name: 'group_b',
          from: ['user3', 'user4', 'user2']
        }
      ]
    }
  }

  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user3', 'user4'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user3', 'user4', 'user5'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user3'],
      'owner'
    ).satisfy()
  ).toBeFalsy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2'], 'owner').satisfy()
  ).toBeFalsy()
})

test('One group with minimum', async () => {
  const settings: Settings = {
    approvals: {
      groups: [
        {
          name: 'group_a',
          minimum: 2,
          from: ['user1', 'user2', 'user3']
        }
      ]
    }
  }

  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2'], 'owner').satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user3'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user4'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1'], 'owner').satisfy()
  ).toBeFalsy()
})

test('Multiple groups with minimum', async () => {
  const settings: Settings = {
    approvals: {
      groups: [
        {
          name: 'group_a',
          minimum: 1,
          from: ['user1', 'user2']
        },
        {
          name: 'group_b',
          minimum: 2,
          from: ['user3', 'user4', 'user2']
        }
      ]
    }
  }

  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user3', 'user4'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user4'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(
      settings,
      ['user1', 'user2', 'user3'],
      'owner'
    ).satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user1', 'user2'], 'owner').satisfy()
  ).toBeFalsy()
})

test('PR owner', async () => {
  const settings: Settings = {
    approvals: {
      groups: [
        {
          name: 'group_a',
          minimum: 1,
          from: ['user1', 'user2']
        }
      ]
    }
  }

  expect(
    new ReviewGatekeeper(settings, ['user2'], 'user1').satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user2', 'user3'], 'user1').satisfy()
  ).toBeTruthy()
  expect(
    new ReviewGatekeeper(settings, ['user3'], 'user1').satisfy()
  ).toBeFalsy()
})
