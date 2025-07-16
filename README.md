# Evolution YGO Web Ranking

Evolution YGO Web Ranking is a web application built with Astro to display the ranking and statistics of duelists on the Evolution YGO server. It provides an interactive platform for players to track their progress, view top players, and access important game-related information.

## Features


*   **Duelist Rankings:** View a sortable and filterable list of the top duelists, filterable by season and ban list.
*   **Player Statistics:**  See detailed stats for each player, including points, wins, losses, win rate, and obtained achievements.
*   **Special Commands:**  Access a comprehensive table of special commands available on the Evolution YGO server for various formats like TCG, OCG, GOAT, and Edison.
*   **Banlist Information:** Stay up-to-date with the current banlists for different formats.
*   **Game Clients:** View a list of known game clients to connect to the server.
*   **Dynamic Configuration:** Dynamically generate the `user_configs.json` file with official and community servers and resources.
*   **User Authentication:** Provides user authentication, reset password functionality
*   **User Profile Management:** Users can change their username and password from their profile.
*   **Real-Time Duel Visualization:** Watch duels in real-time.
## Technologies Used

*   [Astro](https://astro.build/):  A modern static site builder.
*   [React](https://react.dev/):  For building interactive UI components.
*   [Svelte](https://svelte.dev/): For building UI components.
*   [Tailwind CSS](https://tailwindcss.com/):  A utility-first CSS framework for styling.
*   [DaisyUI](https://daisyui.com/):  Tailwind components
*   [Nanostores](https://github.com/nanostores/nanostores):  A tiny state management library.
*   [Vitest](https://vitest.dev/): For unit testing.


## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run build`           | Build your production site to `./dist/`          |
| `bun run preview`         | Preview your build locally                        |
| `bun run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun run astro -- --help` | Get help using the Astro CLI                     |

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions to improve Evolution YGO Web Ranking! If you'd like to contribute, please follow these steps:

1.  **Fork the repository:** Create your own fork of the project on GitHub.
2.  **Create a new branch:** For each new feature or bug fix, create a new branch from `main`.
    ```bash
    git checkout -b feature/your-feature-name
    ```
3.  **Make your changes:** Implement your feature or bug fix.
4.  **Test your changes:** Ensure that your changes don't break any existing functionality and add tests for new features if applicable.
5.  **Commit your changes:** Follow the conventional commit format for your commit messages.
6.  **Push your branch:** Push your changes to your forked repository.
    ```bash
    git push origin feature/your-feature-name
    ```
7.  **Create a Pull Request:** Open a pull request from your branch to the `main` branch of the original repository. Please create one pull request per feature to facilitate testing and validation. Provide a clear title and description for your PR.

We'll review your contribution as soon as possible. Thank you for helping us make this project better!
