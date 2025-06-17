# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /app
EXPOSE 8082
COPY . .
WORKDIR "./"
RUN dotnet restore
RUN dotnet publish AITrainer/AITrainer.csproj -c Release -o out

# Database Migration Stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS migration
WORKDIR /app
COPY --from=build /app/out .
RUN dotnet ef database update

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:7.0 
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "AITrainer.dll"]