// jest.config.js
module.exports = {
  // This line is the fix. It tells Jest to transform the 'uuid' package.
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)/',
  ],
  // This tells Jest to stop running after the first test fails (faster debugging)
  bail: 1,
  // This tells Jest to be a bit quieter in the logs
  verbose: false,
};