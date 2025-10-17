Boardgame - Universal Randomizer
===

A PWA in order to manage randomization for any boardgame.

# Development

The application is developed using:

* [Nx](https://nx.dev/)
* [Angular](https://angular.dev/)


## Start locally

```bash
# 1. From root
npx nx serve boardgame-universal-randomizer

# 2. From apps/boardgame-universal-randomizer
npx nx serve
```

## Launch tests

```bash
# 1. From root
npx nx test boardgame-universal-randomizer

# 2. From apps/boardgame-universal-randomizer
npx nx test
```

## Build

```bash
# 1. From root
npx nx build boardgame-universal-randomizer

# 2. From apps/boardgame-universal-randomizer
npx nx build
```

# Design

## Data model

The complete [JSON Schemas](https://json-schema.org/) are available at [assets/json-schema/data-model/](./assets/json-schema/data-model/).

### `Module`

Schema: [module.json](./assets/json-schema/data-model/module.json)

The main component of data is the `Module`. A `Module` defines the covered `Games`. Many `Modules` may define data of the same `Game`, data are merged by default except if a `Module` specify otherwise.

Thus, `Modules` are ordered to fix merging priorities or overriding.

A `Module` is defined by:

* a unique key matching regular expression: `[a-z0-9][a-z0-9-]*`,
* a name,
* a description,
* a merge strategy,
* an update date.

### `Game`

Schema: [game.json](./assets/json-schema/data-model/game.json)

This the first context selected by user. `Game` firstly defines available `Components` that will be picked later on by the randomizer.
`Components` are arranged in hierarchical `Sets`, and then `kind`.

Each `Game` is defined by:

* a unique key matching regular expression: `[a-z0-9][a-z0-9-]*`,
* a name,
* a description,
* a list of `Sets`,
* a merge strategy,
* an update date.

### `Set`

Schema: [set.json](./assets/json-schema/data-model/set.json)

`Sets` may contain other `Sets` (to create a hierarchy) and `Components` organized by `kind`.

Each `Set` is defined by:

* a unique key (scoped to the `Game`) matching regular expression: `[a-z0-9][a-z0-9-]*`,
* a name,
* a description,
* a list of `Sets`,
* a map of `Components`:
  * each key is a `kind`,
  * each value is a list of `Components` of that `kind`,
* a merge strategy,
* an update date.

### `Component`

Schema: [component.json](./assets/json-schema/data-model/component.json)

`Component` represents a game element that can be picked by the randomizer.

Each `Component` is defined by:

* a unique key (scoped to the `Game`) matching regular expression: `[a-z0-9][a-z0-9-]*`,
* a name,
* a description,
* a merge strategy,
* an update date.
