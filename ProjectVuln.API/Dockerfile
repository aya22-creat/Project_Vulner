# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder

WORKDIR /build

# Copy solution and project files
COPY ProjectVuln.sln ./
COPY ProjectVuln.API/*.csproj ./ProjectVuln.API/
COPY ProjectVuln.Application/*.csproj ./ProjectVuln.Application/
COPY ProjectVuln.Domain/*.csproj ./ProjectVuln.Domain/
COPY ProjectVuln.Infrastructure/*.csproj ./ProjectVuln.Infrastructure/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY ProjectVuln.API/ ./ProjectVuln.API/
COPY ProjectVuln.Application/ ./ProjectVuln.Application/
COPY ProjectVuln.Domain/ ./ProjectVuln.Domain/
COPY ProjectVuln.Infrastructure/ ./ProjectVuln.Infrastructure/

# Build and publish
RUN dotnet publish ProjectVuln.API/ProjectVuln.API.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

# Copy published files
COPY --from=builder /app/publish .

# Expose port
EXPOSE 5284

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD dotnet --version || exit 1

# Set environment to Production
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5284

# Run the application
ENTRYPOINT ["dotnet", "ProjectVuln.API.dll"]
