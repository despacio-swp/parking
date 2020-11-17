module.exports = {
  extends: [
    'plugin:react/recommended',
    '@hellomouse/eslint-config-typescript'
  ],
  env: {
    browser: true,
    es6: true,
    node: true
  },
  plugins: [
    'react'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // typescript
    'react/prop-types': 'off',
    // react components are usually PascalCase but explaining that to eslint is hard
    '@typescript-eslint/naming-convention': 'off',
    'react/react-in-jsx-scope': 'off'
  }
};
