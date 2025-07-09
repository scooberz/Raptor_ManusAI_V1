# Contributing to Project Raptor

This guide provides instructions for setting up the development environment, running the game, and contributing to the codebase. Following these guidelines helps maintain consistency and ensures a smooth development workflow.

## 1. Prerequisites

Before you begin, ensure you have the following software installed on your system:

- **Node.js:** (v18.x or later recommended) - The JavaScript runtime environment.
- **npm:** (v9.x or later) - The Node.js package manager, which is included with Node.js.

## 2. Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/scooberz/Raptor_ManusAI_V1.git
    cd Raptor_ManusAI_V1
    ```

2.  **Install dependencies:**
    Install the project'''s dependencies, such as Jest for testing, using npm.
    ```bash
    npm install
    ```

## 3. Running the Game

This project is a client-side application and needs to be served by a local web server to handle ES6 module loading correctly.

1.  **Start a local server:**
    A simple way to do this is using the `http-server` package, which you can run directly with `npx`. In the root directory of the project, run:
    ```bash
    npx http-server
    ```

2.  **Open the game:**
    Once the server is running, open your web browser and navigate to the local address it provides (e.g., `http://127.0.0.1:8080`). The `index.html` file will be served as the main page.

    **Note:** For the best development experience, open your browser'''s developer tools (F12) and disable the cache in the "Network" tab to prevent issues with stale scripts.

## 4. Running Tests

The project uses Jest for unit testing. To run the test suite, execute the following command from the project root:

```bash
npm test
```

This will run all test files located in the `tests/` directory.

## 5. Code Style & Conventions

- **Language:** The project uses modern JavaScript (ES6+), including ES6 Modules (`import`/`export`).
- **Formatting:** Please match the formatting, naming conventions, and architectural patterns of the existing code. Consistency is key.
- **Comments:** Add comments only when necessary to explain the *why* behind complex logic, not the *what*.

## 6. Project Structure

The project follows a clear, modular structure. When adding new files, please adhere to the existing organization:

- `js/engine/`: Core systems like the game loop, state machine, and asset managers.
- `js/entities/`: Game objects such as the Player, enemies, and projectiles.
- `js/states/`: Different game states (e.g., Menu, GameState, Shop).
- `js/ui/`: UI components like the HUD.
- `assets/`: All game assets (images, data, etc.).
- `docs/`: Project documentation.
- `tests/`: Unit tests.

For a more detailed breakdown, refer to the **Game Architecture** section in `docs/PROJECT_RAPTOR_BIBLE.md`.

## 7. Generating Placeholders

The project includes a utility for generating placeholder assets if needed. This can be run with:
```bash
npm run generate-placeholders
```
