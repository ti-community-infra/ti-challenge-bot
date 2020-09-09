# challenge-bot


[![GitHub Actions](https://github.com/tidb-community-bots/challenge-bot/workflows/Test/badge.svg?branch=master)](https://github.com/features/actions)
[![Codecov](https://badgen.net/codecov/c/github/tidb-community-bots/challenge-bot?icon=codecov)](https://codecov.io/gh/tidb-community-bots/challenge-bot)
[![Probot](https://badgen.net/badge/built%20with/probot/orange?icon=dependabot&cache=86400)](https://probot.github.io/)
[![JavaScript Style Guide](https://badgen.net/badge/code%20style/standard/f2a?cache=86400)](https://standardjs.com)
[![jest](https://facebook.github.io/jest/img/jest-badge.svg)](https://github.com/facebook/jest)
[![ISC License](https://badgen.net/badge/license/ISC/blue?cache=86400)](https://tidb-community-bots.isc-license.org)

> A GitHub App built with [Probot](https://github.com/probot/probot) that A challenge bot for challenge program.

## Require

- Git >= 2.13.0 (**For husky support**)
- Node >= 10
- MYSQL 5.7
- Docker
- Docker Compose >= 3 

## Setup

```sh
# Install dependencies
npm install

# Run with hot reload
npm run build:watch

# Compile and run
npm run build
npm run start
```

## Deploy
```sh
# Docker compose up
docker-compose up -d --build

```


## Contributing

If you have suggestions for how challenge-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2020 Rustin-Liu <rustin.liu@gmail.com>
