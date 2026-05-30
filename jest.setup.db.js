const { setupDockerTest, teardownDockerTest } = require('./__tests__/setup/docker-test');

beforeAll(async () => {
  await setupDockerTest();
}, 60000);

afterAll(async () => {
  await teardownDockerTest();
}, 30000);
