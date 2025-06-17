# VirtualAid-Backend
Started Template for Abp.io (Concerning backend part only) 

Install the ABP CLI in a command line terminal, if you haven't installed it before. 
(dotnet tool install -g Volo.Abp.Cli)  
```bash
https://virtualaid.atlassian.net/wiki/spaces/VA/pages/3768321/Started+Template+for+Abp+backend 
```
VirtualAid-Backend is a backend service built on abp.io, providing APIs to support the client part of the VirtualAid web application.

## BAsic Details
Project name - VirtaulAid 
Project type – multi-layer application 
        Reason: Creates a fully layered solution based on Domain Driven Design practices. Recommended for long-term projects that need a maintainable and extensible codebase. 
UI framework – Angular (Note: we don’t require this so we will remove it in future or abandon it.) 
UI theme – Basic theme  
        Reason: We don’t require UI part so basic theme is selected. 
Database Provider – Entity Framework Core 
Database Mangement System – PostgreSQL 
Mobile support: None 
Separate Identity Server – No 
        Reason: It separates the server side into two applications. The first one is for the identity server and the second one is for your server-side HTTP API. 
Preview (Uses the latest pre-release version) - No 
Separate Solution folder – Yes 
        Reason: Specifies if the project will be in a new folder in the output folder or directly in the output folder. 
Progressive Web Application – No 
        Reason: PWA support is primarily a front-end concern, and it's not tied to the back-end technology. 

## Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Add migrations and update database](#add-migrations-and-update-database)
  - [Run applicaton](#run-application)
- [Usage](#usage)
- [Contributing](#contributing)

## Project Description

VirtualAid-Backend serves as the backend infrastructure for the VirtualAid web app. It offers a set of APIs that enable communication between the client application and the server, facilitating various functionalities of the VirtualAid platform.

## Features

Highlighting the key features of your VirtualAid-Backend project here.

- API endpoints for user authentication
- Data retrieval and storage
- Integration with VirtualAid client app
- ...

## Getting Started

Instructions on how to get started with VirtualAid-Backend. Included information on prerequisites and installation steps.

### Prerequisites

List any prerequisites that users need to have installed or set up before they can use VirtualAid-Backend.

- Visual studio
- PostgreSQL (version X.X.X) or other required databases

### Installation

Step-by-step instructions for installing and setting up VirtualAid-Backend.

```bash
# Clone the repository
git clone https://github.com/yourusername/VirtualAid-Backend.git

# Navigate to the project directory
cd VirtualAid-Backend
```
### Add migrations and update database
Make .DbMigrator as start up project. Configure database connection in 'appsettings.json' or similar configuration file.
Then run this project using IIS server. After this the database will get latest changes.

### Run application
Now make .Host project as start up project. Configure database connection in 'appsettings.json' or similar configuration file.
Then run this project using IIS server.

## Usage

### Making API Requests

VirtualAid-Backend exposes several API endpoints that the VirtualAid web app can interact with. Here's how you can make requests to these endpoints:

#### Authentication

To use the VirtualAid-Backend APIs, you need to authenticate. Obtain an authentication token by following these steps:

1. **Registration**: If you don't have an account, register on the VirtualAid web app.
2. **Login**: Log in to your account.
3. **Cookie**: After successful login, you'll receive cookies. These cookies are required for API authentication.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b new-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin new-feature`).
6. Create a new Pull Request.

---

Happy Coding! 🚀


