module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"],
  prettierPath: require.resolve("prettier-2"),
  setupFiles: ["<rootDir>/config/jest-setup-fetch.js"],
  // snapshotSerializers: ["<rootDir>/config/jest-serializer-prettier2.js"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
}
