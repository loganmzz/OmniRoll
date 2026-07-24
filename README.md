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
# Main application
npm run start
# Documentation
npm run start:docs
```

## Launch tests

```bash
bin/check-test.sh
```

## Build

```bash
npm run build
```

# Deployment

## Netlify

* (Optional) Deploy draft:

```bash
npm run build &&
npm run deploy
```

* Deploy production:

```bash
npm run build -- --prod &&
npm run deploy -- --prod
```

# Design

See [DESIGN.md](./DESIGN.md)

# License

[MIT](./LICENSE.md)
