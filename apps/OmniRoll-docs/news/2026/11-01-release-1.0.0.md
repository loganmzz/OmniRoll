---
title: Release 1.0.0
date: 2026-11-01
authors:
- loganmzz
tags:
- releases
---

We are excited to announce the very first official release of **OmniRoll**! 🎲✨

{/* truncate */}

### 🚀 OmniRoll is Now Live!

Try it out today: **[OmniRoll](https://omniroll.netlify.app)**

**OmniRoll** is a fast, flexible web application designed to manage and generate random setups for your favorite board games.

It has been built as a [Progressive Web Application (PWA)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps):

* **Install Anywhere:** Add it directly to your home screen or desktop as a standalone app.
* **Works Offline:** No internet connection required once loaded—perfect for game nights on the go!

### 🌟 Key Features

**OmniRoll** is organized into three core sections:

1. **[Referential](/#referential):** The central database of supported games and their components. **OmniRoll** comes with pre-loaded data, but you can easily [extend it with your custom data modules](/#writing-a-module).
2. **[Collection](/#collection):** Select the games and expansions you actually own, pick from referential. **OmniRoll** filters content so you only roll setups with components available from your collection.
3. **[Game / Randomizer](/#game-page):** Pick a supported game and roll a randomized setup based on your collection.

### 🎮 Getting Started

1. **First Launch:** **OmniRoll** silently synchronize the referential. When application is ready, it will have nothing to show as your collection is empty.
2. **Set up Your Game Collection:** Head over to **Collection** and toggle the games and expansions you own.
3. **Select a Game:** Choose a game (currently supporting [Aeon's End](https://boardgamegeek.com/boardgame/191189/aeons-end) and [Skytear Horde](https://boardgamegeek.com/boardgame/344789/skytear-horde)). Once more, no content.
2. **Set up Your Content Collection:** Edit your collection to select owned sets. After that, you will be able to select a randomizer from the game page.
4. **Roll Your Setup:** Adjust any parameters (such as player count), click **Roll**, and get ready to play

### 🔮 What’s Coming Next

This is just the beginning! Here is a preview of upcoming games and features already on the roadmap:

#### 🎲 Game
  * [Street Masters](https://boardgamegeek.com/boardgame/218421/street-masters) ([Issue #11](https://github.com/loganmzz/OmniRoll/issues/11))
  * [Zombicide](https://boardgamegeek.com/boardgame/113924/zombicide) ([Issue #37](https://github.com/loganmzz/OmniRoll/issues/37))
  * [Shards of Infinity](https://boardgamegeek.com/boardgame/244115/shards-of-infinity) ([Issue #14](https://github.com/loganmzz/OmniRoll/issues/14))

#### 🛠️ Feature:
  * **Collection: set content location** ([Issue #42](https://github.com/loganmzz/OmniRoll/issues/42))<br/>
    Specify where your game content is located, depending on your storage setup.
  * **Randomizer: link slots** ([Issue #24](https://github.com/loganmzz/OmniRoll/issues/24))<br/>
    Connect slots so available options are scoped based on previously rolled components.
  * **Randomizer: history**<br/>
    Save generated setups and might later be used to generate tracking sheets/boards.

#### 🎨 UI/UX:
  * **Card: customization** ([Issue #27](https://github.com/loganmzz/OmniRoll/issues/27))<br/>
    Card is the term used to display content. Whatever it's the game on main page, the randomizer or selected component for randomizer slots. This feature aim to allow some customization (e.g. border, background, ...).<br/>
    For example, showing ennemies in red and allies in green.<br/>

### 🤝 Get Involved & Contribute

**OmniRoll** is an [Open-source software](https://en.wikipedia.org/wiki/Open-source_software), and source code is available on [GitHub](https://github.com/loganmzz/OmniRoll), but also [issues](https://github.com/loganmzz/OmniRoll/issues).

You can help shape the future of the project by:

* 🐛 reporting bugs,
* 💡 suggesting new ideas (feature, improvement, etc.),
* 🧩 proposing new games or content,
* 👍 upvoting issues to help prioritize what the community wants the most.

Thank you for checking out **[OmniRoll](https://omniroll.netlify.app)**, and happy gaming! 🎲
