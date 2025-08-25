## Getting Started
First, run the development server:

```bash
pnpm i
pnpm dev
```

## Making production build

Run the following:

```bash
pnpm package
```
This should create a production bundle for your extension, ready to be zipped and published to the stores.

## publish
changeset_version -> push-release -> fetch-releases -> publish chrome extension store
split it to 2 actions:
1. changeset_version -> push-release
2. fetch-releases -> build prod package -> publish chrome extension store -> git add .

### local
run `pnpm run bump_and_push_and_fetch` to bump version, push latest release to github, and fetch releases for blazswtich-extension