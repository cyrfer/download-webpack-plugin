
module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es2021": true,
    "node": true,
    "jest/globals": true
  },
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "extends": "eslint:recommended",
  "plugins": ["jest"],
  "rules": {
    "semi": ["error", "never"],
  }
}
