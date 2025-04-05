# Gamified Study Planner Frontend

This project is the frontend for the Gamified Study Planner, a tool designed to help students organize their studies, track progress, and stay motivated through gamification.

## Features

*   **Task Management:** Create, organize, and track study tasks.
*   **XP System:** Earn experience points (XP) for completing tasks.
*   **Leveling System:** Level up as you accumulate XP.
*   **Leaderboard:** Compete with other users on the leaderboard.
*   **AI Study Buddy (Currently Unavailable):** An AI assistant to help with study-related questions.

## Tech Stack

*   React
*   TypeScript
*   Vite
*   Tailwind CSS
*   Redux Toolkit

## Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the frontend directory:**

    ```bash
    cd gamified-study-planner-frontend
    ```
3.  **Install dependencies:**

    ```bash
    npm install
    ```

    or

    ```bash
    yarn install
    ```
4.  **Configure environment variables:**

    *   Create a `.env` file in the root of the `gamified-study-planner-frontend` directory.
    *   Add the following variables, replacing the values with your actual configuration:

        ```
        VITE_API_BASE_URL=http://localhost:5000/api
        ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

    or

    ```bash
    yarn dev
    ```

    The frontend will be available at `http://localhost:5173`.

## Known Issues/Limitations

*   **AI Study Buddy:** The AI study coach (chatbot) feature is currently under development and not yet functional. It will be enabled in a future update.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

