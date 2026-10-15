---
title: Release 1.0.0
date: 2026-11-01
authors:
- loganmzz
tags:
- releases
---

This is the very first official release!

{/* truncate */}

### OmniRoll is now officially released!

Go to: [OmniRoll](https://omniroll.netlify.app)

It is a Web application for managing random setup for any board game.

It has been designed as [Progressive Web Application](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps):

* It can be installed as a standalone application on your device (or from a Web browser).
* It works offline. No Internet connnection required.

### Key Features

Application is basically split into three parts:

1. [Referential](/#referential): This is the database of all available games and their components. Application provides some but it can be [extended with your own data](/#writing-a-module).
2. [Collection](/#collection): This is selection of owned content pick from the referential. This define which games and components, application will use.
3. [Game / Randomizer](/#game-page): List game randomizer, once selected, you can generate random setups based on your collection.

### Get started

On first launch, application will silently synchronized the referential. When application is ready, it will have nothing to show as your collection is empty. Next, edit your game collection in order to add owned games.

Then, select a game. Once more, no content. Edit your collection to select owned sets. After that, you will be able to select a randomizer from the game page.

If necessary edit form to change some values (e.g. number of players), and click Roll to randomly generate a new setup.
