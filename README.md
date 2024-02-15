# Project-X: Simple Social Media Site

This repository contains the code for a basic social media site named Project-X. The backend is built with Laravel, and the frontend is developed using React.

## Prerequisites

Before you begin, make sure you have the following installed on your machine:

- PHP
- Composer
- Node.js
- NPM

## Getting Started

1. **Clone the repository:**

   ```
   git clone https://github.com/Mostafa-Ben-Git/Project-X.git
   ```
2. **Navigate to the project directory:**

   ```
   cd project-x
   ```
## Backend Setup

1. **Navigate to the BACKEND directory:**

   ```
   cd BACKEND
   ```
2. **Install PHP dependencies:**

   ```
   composer install
   ```
3. **Copy the .env.example file to .env:**

   ```
   cp .env.example .env
   ```
4. **Generate the application key:**

   ```
   php artisan key:generate
   ```
5. **Set up your database in the .env file:**

   ```
    DB_CONNECTION=mysql
    DB_HOST=your_database_host
    DB_PORT=your_database_port
    DB_DATABASE=your_database_name
    DB_USERNAME=your_database_username
    DB_PASSWORD=your_database_password
   ```
6. **Migrate the database:**

   ```
   php artisan migrate
   ```
7. **Start the server API :**

   ```
   php artisan serve
   ```

## Frontend Setup

1. **Navigate to the FRONTEND directory:**

   ```
   cd ../FRONTEND
   ```
2. **Install Node.js dependencies:**

   ```
   npm install
   ```
3. **Start the development server:**

   ```
   npm run dev
   ```
## Contributing
Feel free to contribute to the project by opening issues or submitting pull requests. We welcome any improvements or additional features!

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
