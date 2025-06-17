# Base image
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app

############################## Server build ################################
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS serverbuild
WORKDIR /app
COPY . .
RUN dotnet publish /app/aspnet-core/src/VirtaulAid.HttpApi.Host/VirtaulAid.HttpApi.Host.csproj -c Release -o /app/publish/host &&\
    dotnet publish /app/aspnet-core/src/VirtaulAid.DbMigrator/VirtaulAid.DbMigrator.csproj -c Release -o /app/publish/mig

# Host image
FROM base AS host
WORKDIR /app
COPY --from=serverbuild /app/publish/host .
CMD ["dotnet", "VirtaulAid.HttpApi.Host.dll"]

# DbMigrator image
FROM base AS migrator
WORKDIR /app
COPY --from=serverbuild /app/publish/mig .
CMD ["dotnet", "VirtaulAid.DbMigrator.dll"]