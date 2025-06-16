# Use official .NET 9.0 SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set working directory in the container
WORKDIR /app

# Copy project file(s) and restore dependencies
COPY *.csproj .
RUN dotnet restore

# Copy the rest of the application source code
COPY . .

# Build the application in release mode
RUN dotnet publish -c Release -o /out

# Use official runtime image for .NET 9.0
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime

# Set working directory in the container
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /out .

# Expose the port your application listens on
# EXPOSE 8080
# EXPOSE 443

# Set the entry point for the container
ENTRYPOINT ["dotnet", "LakePulse.dll"]

