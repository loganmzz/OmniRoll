OmniRoll
===

> One App. Every Game. Infinite Setups.

A [Progressive Web Application](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) in order to manage randomization for any boardgame.

# Development

The application is developed using:

* [Nx](https://nx.dev/)
* [Angular](https://angular.dev/)


## Start locally

```bash
# 1. From root
npx nx serve apps/OmniRoll

# 2. From apps/OmniRoll
npx nx serve
```

## Launch tests

```bash
# 1. From root
npx nx test apps/OmniRoll

# 2. From apps/OmniRoll
npx nx test
```

## Build

```bash
# 1. From root
npx nx build OmniRoll

# 2. From apps/OmniRoll
npx nx build
```

# Deployment

## Netlify

* (Optional) Deploy draft:

```bash
npx netlify deploy --filter="OmniRoll"
```

* Deploy production:

```bash
npx netlify deploy --prod --filter="OmniRoll"
```

# Design

See [DESIGN.md](./DESIGN.md)

# License

[MIT](./LICENSE.md)
