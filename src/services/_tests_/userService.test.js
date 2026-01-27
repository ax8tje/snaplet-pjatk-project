// src/services/__tests__/userService.test.js

const userService = require('../userService');

test('User service should have required functions', () => {
  expect(userService.createUser).toBeDefined();
  expect(userService.getUserProfile).toBeDefined();
  expect(userService.updateUserProfile).toBeDefined();
  expect(userService.searchUsers).toBeDefined();
  expect(userService.subscribeToUser).toBeDefined();
});
