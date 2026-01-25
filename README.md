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

* a unique key matching regular expression: `[a-z0-9][a-z0-9_-]*`,
* a name,
* a description,
* a list of `Sets`,
* a list of `Randomizer`,
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

### `Randomizer`

Schema: [randomizer.json](./assets/json-schema/data-model/randomizer.json)

Each `Randomizer` is defined by:

* a unique key (scoped to the `Game`) matching regular expression: `[a-z0-9][a-z0-9-]*`,
* a name,
* a description,
* a list of `Pool` (represents selectable components):
  * a unique key (scoped to the `Randomizer`) matching regular expression: `[a-z0-9][a-z0-9-]*`,
  * a list of logical disjunction `Criteria`
* an optional list of groups:
  * a unique key (scoped to the `Randomizer`) matching regular expression: `[a-z0-9][a-z0-9-]*`,
  * a name
* a list of `Slot` (represents a component to pick):
  * a unique key (scoped to the `Randomizer`) matching regular expression: `[a-z0-9][a-z0-9-]*`,
  * a name
  * a `Pool` key,
  * a group key (if and only if there are groups),
  * a pick method:
    * `remove`: remove component from `Pool`, it can't be picked anymore from the same `Pool`,
    * `keep`: component can be picked several times from the same `Pool`,
  * a list of logical disjunction `Criteria`
* a merge strategy,
* an update date.

### `Criteria`

A `Criteria` is represented by a string as local conjonction of `Criterion` separated by `&&` and at least one space before and after:

* `<criterion>`
* `<criterion> && <criterion> && <criterion>`
* `<criterion>   &&       <criterion>`

A `criterion` can be prefixed by `!` to reverse result. And can have the following forms:
* Unary operations:
  * `<value>`:
    * `<value>` must be one of:
      * `true` boolean
      * a number different from zero
      * a non-empty string
      * a non-empty collection
* Binary operations:
  * `<left> == <right>`
    * Must be equal if both have the same value and same type from boolean, number and string
    * Must be set equal if both are collections
    * One (`<left>` or `<right>`) must contain the other one (`<right>` or `<left>`) if one is a collection and the other one is a string
  * `<left> != <right>`
    * Negation of equality as define above
  * `<left> > <right>`
    * `<left>` is `true` and `<right>` is `false`
    * `<left>` is a number strictly greater than `<right>`
    * `<left>` is a string higher in lexicographical order than `<right>` string
    * `<left>` collection includes `<right>` string
    * `<left>` collection includes `<right>` collection but `<left>` has more items
  * `<left> >= <right>`
    * `<left>` is `true` and `<right>` is a boolean
    * `<left>` is `false` and `<right>` is `false`
    * `<left>` is a number greater or equal to `<right>`
    * `<left>` is a string equal or higher in lexicographical order than `<right>` string
    * `<left>` collection includes `<right>` string
    * `<left>` collection includes `<right>` collection
  * `<left> < <right>`
    * `<left>` is `false` and `<right>` is `true`
    * `<left>` is a number strictly lesser than `<right>`
    * `<left>` is a string lower in lexicographical order than `<right>` string
    * `<left>` string is included in `<right>` collection
    * `<left>` collection is included in `<right>` collection but `<right>` has more items
  * `<left> <= <right>`
    * `<left>` is a boolean and `<right>` is `true`
    * `<left>` is `false` and `<right>` is `false`
    * `<left>` is a number lesser or equal to `<right>`
    * `<left>` is a string equal or lower in lexicographical order than `<right>` string
    * `<left>` string is included in `<right>` collection
    * `<left>` collection is included in `<right>` collection
  * `<left> in <right>`
    * `<left>` string or collection is included in `<right>` collection

A `<value>` can be:
* A boolean: `true` or `false`
* A number: `0`, `1`, ...
* A string (enclosed by `'` and using `\` to escape): `'hello'`, `'aeon\'s end'`, ...
* A set/collection of strings (enclosed by `[]`):  `[]`, `['a', 'b']`, ...
* A reference to a property (`@<property-name>`): `@key`


Examples:
* `@kind == 'spell'`
* `@kind in ['spell', 'creature']`
* `@cost > 2`

# License

[MIT](./LICENSE.md)
