# Contributing

To contribute to the common library, there are some guidelines in place to ensure that no untidy, untested or unreviewed code is merged into the main branch. This is to ensure that the library is always in a working state and that it is easy to maintain and extend.

## Requirements

[`pre-commit`](https://pre-commit.com/) is used to ensure that the code is formatted correctly and that the tests pass. To install `pre-commit`, run the following command:

```bash
pip install pre-commit auto-changelog
pre-commit install
```

## Pull Requests

When creating a pull request, please ensure that the following requirements are met:

- code is formatted correctly,
- tests pass, and that
- the code is reviewed by at least one [Avail](https://github.com/availx) team member
