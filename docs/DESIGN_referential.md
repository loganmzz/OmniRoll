Design - Referential
===

Base (and raw) data model defining ALL available games and their components from a `Source`. Each game is compound of: `Set` tree (each containing `Component`) and `Randomizer`.

## Data Model

The complete [JSON Schemas](https://json-schema.org/) are available at [assets/json-schema/referential/](./assets/json-schema/referential/).

### `Module`

Schema: [module.json](./assets/json-schema/referential/module.json)

The main component of data is the `Module`. A `Module` defines the covered `Games`. Many `Modules` may define data of the same `Game`, data are merged by default except if a `Module` specify otherwise.

Thus, `Modules` are ordered to fix merging priorities or overriding.

A `Module` is defined by:

* a unique key matching regular expression: `[a-z0-9][a-z0-9_-]*`,
* a name,
* a description,
* a merge strategy,
* an update date.

### `Game`

Schema: [game.json](./assets/json-schema/referential/game.json)

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

Schema: [set.json](./assets/json-schema/referential/set.json)

`Sets` may contain other `Sets` (to create a hierarchy) and `Components` organized by `kind`.

Each `Set` is defined by:

* a unique key (scoped to the `Game`) matching regular expression: `[a-z0-9][a-z0-9_-]*`,
* a name,
* a description,
* a list of `Sets`,
* a map of `Components`:
  * each key is a `kind`,
  * each value is a list of `Components` of that `kind`,
* a merge strategy,
* an update date.

### `Component`

Schema: [component.json](./assets/json-schema/referential/component.json)

`Component` represents a game element that can be picked by the randomizer.

Each `Component` is defined by:

* a unique key (scoped to the `Game`) matching regular expression: `[a-z0-9][a-z0-9_-]*`,
* a name,
* a description,
* optional additional properties:
  * each value is one of:
    * a boolean,
    * a number,
    * a string,
    * a collection of strings (set),
* a merge strategy,
* an update date.

### `Randomizer`

Schema: [randomizer.json](./assets/json-schema/referential/randomizer.json)

Each `Randomizer` is defined by:

* a unique key (scoped to the `Game`) matching regular expression: `[a-z0-9][a-z0-9_-]*`,
* a name,
* a description,
* a list of `Pool` (represents selectable components):
  * a unique key (scoped to the `Randomizer`) matching regular expression: `[a-z0-9][a-z0-9_-]*`,
  * a optional `Criteria`
* an optional list of groups:
  * a unique key (scoped to the `Randomizer`) matching regular expression: `[a-z0-9][a-z0-9_-]*`,
  * a name
* a list of `Slot` (represents a component to pick):
  * a unique key (scoped to the `Randomizer`) matching regular expression: `[a-z0-9][a-z0-9_-]*`,
  * a name
  * a `Pool` key,
  * a group key (if and only if there are groups),
  * a pick method:
    * `remove` (default): remove component from `Pool`, it can't be picked anymore from the same `Pool`,
    * `keep`: component can be picked several times from the same `Pool`,
  * an optional `Criteria`
* a merge strategy,
* an update date.

### `Criteria`

A `Criteria` is a boolean `Expression` which is evaluated for each `Component` to determine if it is eligible for selection in a `Pool` or a `Slot`.

Context:

* `component`: the `Component` being evaluated, with all its properties.
* `cmp`: alias for `component`.
* `c`: alias for `component`.
