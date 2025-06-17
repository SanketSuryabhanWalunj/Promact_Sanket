# Lake Pulse

## Overview
Lake Pulse is a backend application designed to efficiently manage and analyze lake data. Built using modern technologies, the project ensures high performance, scalability, and ease of use.

## Tech Stack
- **Framework:** .NET Core 9
- **Database:**
  - PostgreSQL (primary database for data storage)
  - Amazon Redshift (used exclusively for fetching lake data)
- **Authentication:** AWS Cognito

## Features
- Robust backend architecture.
- Integration with PostgreSQL for efficient data storage and retrieval.
- Fetching lake data from Amazon Redshift.
- AWS Cognito for secure user authentication.
- Scalable and maintainable design.

## Getting Started

### Prerequisites
To run the Lake Pulse project, ensure you have the following installed on your system:

- .NET Core 9 SDK
- PostgreSQL

### Installation Steps

#### Installing .NET Core 9

1. Visit the [official .NET download page](https://dotnet.microsoft.com/download).
2. Select the appropriate version for your operating system and download the installer.
3. Follow the installation instructions:
   - **Windows:** Run the installer and complete the setup.
   - **macOS:** Use the installer package or Homebrew (`brew install --cask dotnet`).
   - **Linux:** Follow the distribution-specific instructions on the .NET page (e.g., `apt`, `dnf`, or `yum` packages).
4. Verify the installation by running:
   ```bash
   dotnet --version
   ```

#### Installing PostgreSQL

1. Visit the [official PostgreSQL download page](https://www.postgresql.org/download/).
2. Select your operating system and download the installer.
3. Follow the installation steps:
   - **Windows:** Use the graphical installer, set a password for the "postgres" user, and note the default port (5432).
   - **macOS:** Use Homebrew (`brew install postgresql`).
   - **Linux:** Use your package manager (e.g., `sudo apt install postgresql`).
4. Verify the installation by connecting to PostgreSQL:
   ```bash
   psql -U postgres
   ```
   Enter the password you set during installation.

### Project Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd lake-pulse
   ```

3. Restore dependencies:
   ```bash
   dotnet restore
   ```

### Configuration

Update the `appsettings.json` file with your database and authentication details:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=lake_pulse_db;Username=your_username;Password=your_password",
    "RedshiftConnection": "Host=redshift-cluster.amazonaws.com;Port=5439;Database=lake_data;Username=your_username;Password=your_password"
  },
  "Cognito": {
    "UserPoolId": "your_userpool_id",
    "ClientId": "your_client_id",
    "Region": "your_region"
  }
}
```

### Running the Application

Start the application:
```bash
dotnet run
```

- Once the application starts, the Swagger UI will be accessible (e.g., `http://localhost:<port>/swagger`).
- To test the APIs:
  1. Obtain a Bearer token from AWS Cognito.
  2. Click the **Authorize** button in Swagger UI.
  3. Enter the Bearer token.
  4. Select an API, provide the necessary parameters, and execute the request.

### Database Migrations

To manage database schema changes:

1. Add a migration:
   ```bash
   dotnet ef migrations add <MigrationName>
   ```

2. Apply the migration to the database:
   ```bash
   dotnet ef database update
   ```

### Notes for macOS and Linux

- On **macOS** and **Linux**, ensure the PostgreSQL service is running before starting the application:
  ```bash
  sudo service postgresql start
  ```
- Use the correct file paths for configuration files (`appsettings.json`) if running in a containerized or mounted environment.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Create a pull request.

