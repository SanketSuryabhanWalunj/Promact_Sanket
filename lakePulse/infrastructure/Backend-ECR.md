# LakePulse AWS ECR Repository Infrastructure Documentation

## Overview
This is the Terraform configuration for deploying an Amazon Elastic Container Registry (ECR) repository. The ECR repository is used to store, manage, and deploy Docker container images.

## Components

### ECR Repository

#### Repository Configuration
- Name format: `<environment>/<application>`
- Image tag mutability: Mutable (allows tag overwriting)
- Force delete: Enabled (allows repository deletion with images)

#### Image Scanning
- Scan on push: Disabled
- Manual scanning available through AWS Console or API

#### Resource Tagging
Default tags applied to the repository:
- Environment: Value of `var.environment`
- Team: "DevOps"
- Project: Value of `var.application`

## Resource Outputs
- `app_repo_url`: Outputs the repository URL for use in other resources or deployments

## Variables Reference

### Required Variables
- `environment`: Environment name (e.g., dev, staging, prod)
- `application`: Application name that will be part of the repository name

## Configuration Details

### Image Tag Mutability
- Set to "MUTABLE" allowing image tags to be overwritten
- Useful for development workflows where tags like 'latest' are frequently updated
- Consider changing to "IMMUTABLE" for production environments to prevent accidental overwrites

### Force Delete Configuration
- `force_delete = true` allows deletion of the repository even if it contains images
- Helpful for development and testing environments
- Consider setting to `false` for production environments to prevent accidental deletion

### Image Scanning
- Automatic scanning on image push is disabled (`scan_on_push = false`)
- Manual scanning can be initiated as needed
- Consider enabling `scan_on_push` for production environments

## Security Considerations

1. **Image Tag Mutability**:
   - Mutable tags can lead to deployment inconsistencies
   - Consider using immutable tags in production
   - Use specific version tags rather than generic ones like 'latest'

2. **Image Scanning**:
   - Although disabled by default, implement regular scanning procedures
   - Consider enabling automatic scanning for production repositories
   - Regular vulnerability assessment is recommended

3. **Access Control**:
   - Implement appropriate IAM policies for repository access
   - Use repository policies to control cross-account access if needed
   - Implement least privilege access principles

## Best Practices Implementation

1. **Naming Convention**:
   - Hierarchical naming using environment and application
   - Clearly identifies repository purpose and environment

2. **Tagging Strategy**:
   - Consistent tagging for environment identification
   - Team ownership clearly defined
   - Project association maintained

3. **Resource Management**:
   - Force delete enabled for easier resource cleanup
   - Repository URL output available for reference

## Limitations and Considerations

1. **Image Tag Management**:
   - Mutable tags can lead to confusion in image versioning
   - Implement proper tagging strategy for image versions

2. **Image Scanning**:
   - Disabled automatic scanning requires manual security oversight
   - Implement regular scanning procedures

3. **Resource Deletion**:
   - Force delete enabled could lead to accidental data loss
   - Implement backup procedures for important images

---

## Operations and Maintenance

### Repository Management
- Regular cleanup of unused images
- Monitoring of repository size and usage
- Regular security scanning of stored images

### Cost Management
- Monitor storage usage
- Implement lifecycle policies if needed
- Regular cleanup of unused images

### Security Management
- Regular security scanning
- Access review and audit
- Monitoring of repository activities
---


## Usage Instructions

### Step 1: Initialize Terraform
```bash
terraform init
```

### Step 2: Plan the Deployment
Review the resources to be created:
```bash
terraform plan
```

### Step 3: Apply the Configuration
Deploy the resources:
```bash
terraform apply
```

### Step 4: Verify the Deployment
- Check ECS Cluster, ALB and other component after deployment.

---