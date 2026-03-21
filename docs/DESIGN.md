Design
===

## Overview

OmniRoll is a Progressive Web Application to manage randomization for any boardgame. It is designed to be flexible and extensible to cover a wide range of games and randomization needs.

It is heavily data-centric around three data layer:

* [**Referential**](./DESIGN_referential.md): Base (and raw) data model defining ALL available games and their components from a `Source`. Each game is compound of: `Set` tree (each containing `Component`) and `Randomizer`.
* [**Compendium**](./DESIGN_compendium.md): "Compiled" data from referential. `Component` are flatten and marked with owning `Set` (and all its parent `Sets`).
* [**Collection**](./DESIGN_collection.md): `Game` and `Sets` owned by user.

