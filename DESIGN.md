Design
===

## Data model

The complete [JSON Schemas](https://json-schema.org/) are available at [assets/json-schema/data-model/](./assets/json-schema/data-model/).

### `Module`

Schema: [module.json](./assets/json-schema/data-model/module.json)

The main component of data is the `Module`. A `Module` defines the covered `Games`. Many `Modules` may define data of the same `Game`, data are merged by default except if a `Module` specify otherwise.

Thus, `Modules` are ordered to fix merging priorities or overriding.

A `Module` is defined by:

* a unique key matching regular expression: `[a-z0-9][a-z0-9_-]*`,
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

Schema: [component.json](./assets/json-schema/data-model/component.json)

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

Schema: [randomizer.json](./assets/json-schema/data-model/randomizer.json)

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

### `Expression`

#### Syntax

An `Expression` follow JavaScript (expression) syntax:

* Literals:
  * Boolean: `true` or `false`
  * Number: `0`, `1`, ...
  * String: `'with single quote'`, `"with double quote"`, ...
  * Set/collection of strings:  `[]`, `['a', 'b']`, ...
* A reference to the `Context`:
  * `component`, `component.name`
* Unary operations:
  * `! <expression>`
* Binary operations (from lowest to highest priority):
  * `<left> || <right>`
  * `<left> && <right>`
  * `<left> == <right>`
  * `<left> != <right>`
  * `<left> in <right>`
  * `<left> > <right>`
  * `<left> >= <right>`
  * `<left> < <right>`
  * `<left> <= <right>`
  * `<left> + <right>`
  * `<left> - <right>`
  * `<left> % <right>`
  * `<left> * <right>`
  * `<left> / <right>`
* Ternary expression: `<condition> ? <if-true> : <if-false>`
* Grouping: `(<expression>)`

However some syntax is not supported:

* Literals: `null`, `undefined`, `NaN`, `Infinity`
* Unary operations: `+`, `-`, `~`
* Binary operations: `??`, `===`, `!==`, `<<`, `>>`, `>>>`, `&`, `|`, `^`

#### Evaluation

For detail on how operations are evaluated:

* "Truthy":
  * `true` boolean
  * a number different from zero
  * a non-empty string
  * a non-empty collection

* Unary operations:
  * `! <expression>`:
    * Opposite of "truthy" as defined above
* Binary operations:
  * `<left> == <right>`
    * Must be equal if both have the same value and same type from boolean, number and string
    * Must be set equal if both are collections
    * One (`<left>` or `<right>`) must contain the other one (`<right>` or `<left>`) if one is a collection and the other one is a string
    * Else `false`
  * `<left> != <right>`
    * Negation of equality as define above
  * `<left> > <right>`
    * `<left>` is `true` and `<right>` is `false`
    * `<left>` is a number strictly greater than `<right>`
    * `<left>` is a string higher in lexicographical order than `<right>` string
    * `<left>` collection includes `<right>` string
    * `<left>` collection includes `<right>` collection but `<left>` has more items
    * Else `false`
  * `<left> >= <right>`
    * `<left>` is `true` and `<right>` is a boolean
    * `<left>` is `false` and `<right>` is `false`
    * `<left>` is a number greater or equal to `<right>`
    * `<left>` is a string equal or higher in lexicographical order than `<right>` string
    * `<left>` collection includes `<right>` string
    * `<left>` collection includes `<right>` collection
    * Else `false`
  * `<left> < <right>`
    * `<left>` is `false` and `<right>` is `true`
    * `<left>` is a number strictly lesser than `<right>`
    * `<left>` is a string lower in lexicographical order than `<right>` string
    * `<left>` string is included in `<right>` collection
    * `<left>` collection is included in `<right>` collection but `<right>` has more items
    * Else `false`
  * `<left> <= <right>`
    * `<left>` is a boolean and `<right>` is `true`
    * `<left>` is `false` and `<right>` is `false`
    * `<left>` is a number lesser or equal to `<right>`
    * `<left>` is a string equal or lower in lexicographical order than `<right>` string
    * `<left>` string is included in `<right>` collection
    * `<left>` collection is included in `<right>` collection
    * Else `false`
  * `<left> in <right>`
    * `<left>` string or collection is included in `<right>` collection
    * Else `false`
  * `<left> + <right>`:
    * `<left>` is a boolean and `<right>` is a boolean, then it's the logical OR
    * `<left>` is a number and `<right>` is a number, then it's the sum
    * `<left>` is a string and `<right>` is a boolean, a number, or a string, then it's the concatenation
    * `<left>` is a boolean, a number, or a string and `<right>` is a string, then it's the concatenation
    * `<left>` is a string and `<right>` is a collection, then it's the union of both
    * `<left>` is a collection and `<right>` is a string or a collection, then it's the union of both
  * `<left> - <right>`:
    * `<left>` is `false` and `<right>` is a boolean, then it's `false`
    * `<left>` is `true` and `<right>` is `true`, then it's `false`
    * `<left>` is `true` and `<right>` is `false`, then it's `true`
    * `<left>` is a number and `<right>` is a number, then it's the difference
    * `<left>` is a collection and `<right>` is a string or a collection, then it's the difference of both
  * `<left> % <right>`:
    * `<left>` is a number and `<right>` is a number, then it's the modulo
  * `<left> * <right>`:
    * `<left>` is a boolean and `<right>` is a boolean, then it's the logical AND
    * `<left>` is a number and `<right>` is a number, then it's the product
    * `<left>` is a string and `<right>` is a number, then it's the concatenation of `<left>` repeated `<right>` times
    * `<left>` is a number and `<right>` is a string, then it's the concatenation of `<right>` repeated `<left>` times
  * `<left> / <right>`:
    * `<left>` is a number and `<right>` is a number, then it's the division
