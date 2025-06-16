# Project Raptor: Context & Architecture Guide

## High-Level Goal
This is a 2D, top-down, vertically scrolling space shooter game, built as a tribute to the classic "Raptor: Call of the Shadows." The primary objective is to build out a fun, playable Level 1 with multiple enemy types and a boss battle, followed by a Hangar screen for upgrades.

## Core Architecture
- **`index.html`**: The main entry point for the game.
- **`js/engine/`**: Contains the core game engine classes.
  - **`game.js`**: The main `Game` class that manages the game loop and state machine.
  - **`assets.js`**: The `AssetManager` handles loading all images and sounds.
  - **`entity.js`**: Contains the base `Entity` class and the `EntityManager` which tracks all game objects.
- **`js/entities/`**: Contains classes for all game objects.
  - **`enemy.js`**: The base `Enemy` class. It contains the master `update` loop with the core death sequence (score, money, explosion).
  - **`boss1.js`**: The first boss, which extends the `Enemy` class.
  - **`enemyFactory.js`**: Creates all enemy types based on data.
- **`js/states/`**: Contains all the game states (`GameState`, `HangarState`, `MenuState`, etc.).
- **`js/levels/level1.js`**: A data-driven file that defines all enemy waves, stats, and formations for Level 1. **This is the primary file for level design.**

## Development Workflow
- The project is managed via Git and hosted on a private GitHub repository.
- The official testing and deployment platform is **GitHub Pages**. All testing should be done on the live URL, as the local "Live Server" was found to be unreliable.

## Future Roadmap (Current Tasks)
1.  Implement unique behaviors (movement and attack patterns) for the 8 new enemy types.
2.  Balance enemy/boss health and player weapon damage.
3.  Add new player weapons (e.g., missiles).
4.  Add destructible ground objects.