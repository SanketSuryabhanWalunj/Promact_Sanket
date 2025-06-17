# AITrainer-Backend

Welcome to the AItrainer-Backend project repository! This repository contains the backend codebase for the AI Trainer application, which is a .NET WebAPI project developed in C# with PostgreSQL as its database. This README file will guide you through the setup process, helping you get started with the development of the AItrainer-Backend project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setting up the Development Environment](#setting-up-the-development-environment)
  - [1. Install Visual Studio](#1-install-visual-studio)
  - [2. Install PostgreSQL](#2-install-postgresql)
  - [3. Clone the Repository](#3-clone-the-repository)
  - [4. Configure the Database](#4-configure-the-database)
  - [5. Configure AppSettings](#5-configure-appsettings)
- [Running the Project](#running-the-project)

## Prerequisites

Before you can start working on the AItrainer-Backend project, make sure you have the following prerequisites installed on your system:

- [Visual Studio](https://visualstudio.microsoft.com/): You will need this development environment for C# and .NET development.
- [PostgreSQL](https://www.postgresql.org/): This is the database system used for this project.

## Setting up the Development Environment

Follow these steps to set up your development environment for the AItrainer-Backend project:

### 1. Install Visual Studio

If you don't already have Visual Studio installed, download and install it from the official website: [Visual Studio](https://visualstudio.microsoft.com/).

### 2. Install PostgreSQL

Download and install PostgreSQL from the official website: [PostgreSQL](https://www.postgresql.org/). During installation, make note of the password you set for the PostgreSQL superuser (usually "postgres").

### 3. Clone the Repository

Clone this repository to your local machine using Git:

```bash
git clone https://github.com/Promact/AITrainer-Backend.git
```



### 5. Configure AppSettings

In the "AItrainer-Backend" project, locate the `appsettings.json` file. This file contains configuration settings for the application, including the connection string for the database.

Update the connection string with your PostgreSQL credentials and the database name you created earlier. Here's an example of how the connection string should look:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=aitrainer;Username=postgres;Password=yourpassword;"
}
```

Replace `yourpassword` with the password you set during PostgreSQL installation.

### 4. Configure the Database

1. Open the PostgreSQL command line or use a GUI tool like pgAdmin to create a new database for the project. You can do this by running the following command:

   ```sql
   CREATE DATABASE aitrainer;
   ```

2. Next, you need to apply the database migrations to create the necessary tables and schema. In your project directory, navigate to the "AItrainer-Backend" folder, where you'll find the solution file (`.sln`). Open a command prompt or terminal and run the following command:

   ```bash
   dotnet ef database update
   ```

## Running the Project

You are now ready to run the AItrainer-Backend project:

1. Open the solution file (`AItrainer-Backend.sln`) in Visual Studio.

2. Build the solution to ensure all dependencies are restored:

   - Click on "Build" in the menu.
   - Select "Build Solution" from the dropdown.

3. Start the application by pressing F5 or clicking the "Start" button in Visual Studio.

The API should now be running locally at `http://localhost:5000` (or another port if configured differently).

You can access the API endpoints using tools like [Postman](https://www.postman.com/) to test the functionality.

