# LakePulse AWS RDS PostgreSQL Infrastructure Documentation

## Overview
This is the Terraform configuration for deploying a PostgreSQL database instance on AWS RDS (Relational Database Service) with secure password management. The infrastructure includes an RDS instance, subnet groups, security groups, and password management through AWS Systems Manager Parameter Store.

## Components

### Password Management
The password management system utilizes AWS Systems Manager Parameter Store to securely store and manage the RDS database password.

#### Key Features:
- Generates a secure random password of 45 characters
- Stores the password in AWS SSM Parameter Store as a SecureString
- Password does not include special characters
- Password path format: `/dev/db/<database_name>/<username>/rds_password`

### RDS PostgreSQL Instance

#### Instance Configuration
- Engine: PostgreSQL
- Instance identifier format: `<identifier>-postgresql`
- Storage: Configurable allocated storage with autoscaling capability
- Encryption: Storage encryption enabled by default
- Public accessibility: Enabled
- Backup retention: Configurable retention period
- Final snapshot: Disabled

#### Network Configuration
- Deployed within a specified VPC
- Utilizes a dedicated subnet group spanning two public subnets
- Protected by a security group allowing PostgreSQL access (port 5432) from ECS nodes

#### Security Group Rules
- Inbound access limited to port 5432 (PostgreSQL)
- Access restricted to specified ECS cluster security groups
- No direct outbound rules defined (default AWS security group rules apply)

## Resource Dependencies
The infrastructure components have the following dependencies:

1. Password generation must complete before:
   - SSM Parameter creation
   - RDS instance creation

2. Subnet group must exist before:
   - RDS instance creation

3. Security group must exist before:
   - RDS instance creation

## Variables Reference

### Required Variables
- `rds_pg_db_name`: Database name
- `rds_pg_user`: Database username
- `rds_pg_db_identifier`: Instance identifier
- `rds_pg_engine_version`: PostgreSQL engine version
- `rds_pg_instance_type`: Instance class (e.g., db.t3.micro)
- `rds_pg_instance_disk_size`: Initial allocated storage size
- `ecs_cluster_nodes_security_group_ids`: List of security group IDs for ECS nodes

### Optional Variables
- `rds_pg_backup_retention_period`: Backup retention period in days
- `rds_pg_max_allocated_storage`: Maximum storage limit for autoscaling
- `rds_pg_db_tags`: Tags to apply to RDS resources

## Security Considerations

1. **Password Management**:
   - Passwords are automatically generated and not stored in Terraform state
   - Passwords are stored securely in SSM Parameter Store
   - No special characters in password to avoid potential compatibility issues

2. **Network Security**:
   - Database access is restricted to specific ECS security groups
   - Database is deployed in a VPC with controlled access
   - Although publicly accessible, access is still controlled via security groups

3. **Encryption**:
   - Storage encryption is enabled by default
   - Passwords are stored as SecureString in SSM Parameter Store

## Best Practices Implementation

- Uses dedicated security groups for access control
- Implements encrypted storage
- Utilizes managed backup solutions
- Stores sensitive information in SSM Parameter Store
- Implements multi-AZ subnet groups for availability
- Uses tags for resource organization

## Limitations and Considerations

1. **Public Accessibility**:
   - The RDS instance is configured as publicly accessible
   - Consider setting `publicly_accessible = false` for production environments

2. **Final Snapshot**:
   - Final snapshots are disabled (`skip_final_snapshot = true`)
   - Consider enabling for production environments

3. **Password Rotation**:
   - No automatic password rotation is configured
   - Consider implementing AWS Secrets Manager for automatic rotation

## Maintenance and Operations

### Backup Management
- Automated backups are enabled
- Retention period is configurable via variables
- No final snapshot on deletion

### Storage Management
- Initial storage size is configurable
- Supports automatic storage scaling up to `max_allocated_storage`
- Storage is encrypted by default