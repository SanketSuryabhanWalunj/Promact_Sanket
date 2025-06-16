# LakePulse AWS ECS Infrastructure Documentation

## Overview
This is the Terraform configuration for deploying a containerized application using Amazon ECS (Elastic Container Service) with EC2 launch type. The infrastructure includes Application Load Balancer (ALB), Auto Scaling Groups (ASG), ECS Cluster, Services, and related components.

## Core Components

### 1. Application Load Balancer (ALB)
#### Configuration
- Name Format: `${environment}-${application}-alb`
- Type: Application Load Balancer
- Network: Deployed in public subnets
- Listeners:
  - HTTP (Port 80): Redirects to HTTPS
  - HTTPS (Port 443): Uses ACM certificate
  - Host-based routing to target group

#### Security Group
- Allows inbound HTTP (80) and HTTPS (443)
- Source: 0.0.0.0/0 (public access)
- All outbound traffic allowed

---

### 2. Auto Scaling Group (ASG)
#### Configuration
- Name Format: `${environment}-${application}-ecs-asg`
- Size: Min 1, Max 2, Desired 1
- Health Check: EC2
- Launch Template: Latest version
- Deployment: Across public subnets

---

### 3. ECS Cluster
#### Configuration
- Name Format: `${environment}-${application}-cluster`
- Capacity Provider: EC2 instances
- Auto Scaling enabled

---

### 4. ECS Service
#### Configuration
- Name Format: `${environment}-${application}-app`
- Task Definition: Bridge network mode
- Load Balancer Integration: Port 8080
- Placement Strategy: AZ spread
- Desired Count: 1 (with auto-scaling)

---

### 5. Service Auto Scaling
#### Configuration
- Scaling Targets: 1-5 tasks
- Metrics:
  - CPU Utilization Target: 80%
  - Memory Utilization Target: 80%
- Cooldown Periods: 300 seconds

---

## IAM Roles and Policies

### 1. ECS Node Role
- Service: EC2
- Policy: AmazonEC2ContainerServiceforEC2Role
- Instance Profile Created

### 2. ECS Task Role
- Service: ECS Tasks
- Custom Policies Available

### 3. ECS Execution Role
- Service: ECS Tasks
- Policy: AmazonECSTaskExecutionRolePolicy


---
## Security Groups

### 1. ALB Security Group
- Inbound: Ports 80, 443 from internet
- Outbound: All traffic allowed

### 2. ECS Node Security Group
- Inbound: All traffic from ALB security group
- Outbound: All TCP traffic

### 3. ECS Task Security Group
- Inbound: All traffic within VPC
- Outbound: All traffic allowed


---
## Task Definition
#### Configuration
- Family: `${environment}-${application}-app-td`
- CPU: 600 units
- Memory: 600 MB
- Network Mode: bridge
- Container Configuration:
  - Port Mapping: 8080
  - Logging: CloudWatch
  - Environment Variables Supported

---

## Capacity Provider Strategy
#### Configuration
- Type: Auto Scaling Group
- Minimum Scaling: 1
- Maximum Scaling: 1
- Target Capacity: 100%
- Managed Scaling: Enabled

## Auto Scaling Policies

### Service Auto Scaling
- Target Tracking Policies:
  1. CPU Utilization
     - Target: 80%
     - Scale In/Out Cooldown: 300s
  2. Memory Utilization
     - Target: 80%
     - Scale In/Out Cooldown: 300s

---

## Launch Template Configuration

### ECS Node AMI
- Source: AWS Systems Manager Parameter Store
- Parameter: `/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id`
- AMI Type: Amazon ECS-Optimized Amazon Linux 2

### Launch Template Details
- Name Format: `${environment}-${application}-ecs-ec2-`
- Instance Type: t2.micro
- Security Groups: ECS Node Security Group
- IAM Instance Profile: ECS Node Profile
- Monitoring: Enhanced monitoring enabled
- Key Pair: Configurable via variable
- User Data: Configures ECS Cluster association

### User Data Configuration
```bash
#!/bin/bash
echo ECS_CLUSTER=${cluster_name} >> /etc/ecs/ecs.config;
```

---

## Networking

### VPC Configuration
- CIDR Block: 10.10.0.0/16
- DNS Hostnames: Enabled
- DNS Support: Enabled
- Name Format: `${environment}-${application}-vpc`

### Subnet Configuration
- Count: 2 public subnets
- Availability Zones: Automatically selected from available AZs
- CIDR Blocks: Calculated using cidrsubnet function
- Auto-assign Public IP: Enabled
- Name Format: `${environment}-${application}-public-${az_name}`

### Internet Gateway
- Attached to main VPC
- Name Format: `${environment}-${application}-igw`

### Elastic IPs
- Count: Matches AZ count
- Name Format: `${environment}-${application}-eip-${az_name}`
- Dependent on Internet Gateway creation

---

### Route Tables
#### Public Route Table
- Routes all traffic (0.0.0.0/0) to Internet Gateway
- Associated with all public subnets
- Name Format: `${environment}-${application}-rt-public`

### Load Balancer Target Group
- Protocol: HTTP
- Port: 8080
- Target Type: Instance
- Health Check:
  - Path: /api/Health/Check
  - Interval: 10s
  - Timeout: 5s
  - Healthy Threshold: 2
  - Unhealthy Threshold: 3

---

### Load Balancer Target Group
- Protocol: HTTP
- Port: 8080
- Target Type: Instance
- Health Check:
  - Path: /api/Health/Check
  - Interval: 10s
  - Timeout: 5s
  - Healthy Threshold: 2
  - Unhealthy Threshold: 3

---

## Best Practices Implementation

1. **High Availability**
   - Multi-AZ deployment
   - Auto Scaling enabled
   - Health checks configured

2. **Security**
   - HTTPS redirection
   - Secure IAM roles
   - Isolated security groups

3. **Scalability**
   - Automated scaling policies
   - Capacity provider strategy
   - Target tracking metrics

---

## Operations and Maintenance

### Monitoring
- CloudWatch Logs enabled
- Auto Scaling metrics
- ALB metrics and access logs

### Scaling
- CPU and Memory based scaling
- ASG capacity provider
- Service level scaling

### Deployment
- Rolling updates supported
- Launch template versioning
- Task definition updates

---

## Variables Reference

### Required Variables
- `environment`: Environment name
- `application`: Application name
- `ecr_image_uri`: Container image URI
- `acm_cert_arn`: SSL certificate ARN
- `key_pair_name`: EC2 key pair name
- `azs_count`: Number of availability zones (set to 2)
- `azs_names`: List of available AZ names


---

## Outputs
- `alb_url`: Will export the Load balancer DNS name

---
