Design - `Expression`
===

## Syntax

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
