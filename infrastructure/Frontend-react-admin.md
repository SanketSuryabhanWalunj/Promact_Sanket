# LakePulse Frontend Terraform Documentation for AWS CloudFront and S3 Setup

## Overview
This Terraform provisions an AWS CloudFront distribution integrated with an S3 bucket to serve a static website. It includes configuration for security, performance optimization, and error handling.

---

## Prerequisites
- Terraform installed on your machine.
- AWS CLI configured with necessary permissions.
- An active AWS account.

---

## Files and Structure

### 1. **`main.tf`**
Defines the foundational AWS resources, including:

- S3 bucket for website deployment.
- S3 bucket ownership controls.
- S3 bucket ACL.
- S3 bucket policy.

### 2. **`cloudfront.tf`**
Contains the resources for CloudFront:

- CloudFront Origin Access Control.
- CloudFront distribution configuration with default behaviors and error handling.

### 3. **`variables.tf`**
Holds the input variables to parameterize the Terraform configuration.

---

## Variables

### Defined in `variables.tf`:
| Variable Name       | Description                    | Default Value         | Type   |
|---------------------|--------------------------------|-----------------------|--------|
| `aws_profile`       | AWS CLI profile to use.       | `default`             | String |
| `aws_region`        | AWS region for resources.     | `us-east-1`           | String |
| `bucket_name`       | Name of the S3 bucket.        | `my-bucket`           | String |
| `created_by`        | Tag for resource ownership.   | `DevOps`              | String |
| `object_ownership`  | S3 ownership rule.            | `BucketOwnerPreferred`| String |

---

## Resources

### S3 Bucket (`main.tf`)
1. **`aws_s3_bucket.deployment_bucket`**
   - Configures a bucket for static website hosting.
   - Includes `index.html` and `error.html` as default pages.

2. **`aws_s3_bucket_ownership_controls.ownership_controls`**
   - Sets the ownership controls for the bucket.

3. **`aws_s3_bucket_acl.s3_bucket_acl`**
   - Ensures the bucket is private.

4. **`aws_s3_bucket_policy.bucket_policy`**
   - Allows read-only access to the bucket from the CloudFront distribution.

### CloudFront (`cloudfront.tf`)
1. **`aws_cloudfront_origin_access_control.cloudfront_oac`**
   - Creates an Origin Access Control to securely connect CloudFront to the S3 bucket.

2. **`aws_cloudfront_distribution.website_cdn`**
   - Configures a CloudFront distribution for content delivery with:
     - Custom error responses (e.g., redirects for 404 and 403 errors).
     - HTTPS enforcement.
     - Geo-restriction support (currently unrestricted).
     - Compression and caching optimization.

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
- Check the S3 bucket and confirm the static website hosting configuration.
- Verify the CloudFront distribution and its settings.

---

## Tags and Best Practices

### Tags
- All resources include a `Created_By` tag, with the default value set to the `created_by` variable.

### Best Practices
- Use meaningful names for resources and buckets.
- Restrict access using IAM roles and policies.
- Regularly update and secure CloudFront certificates.

---

## Additional Notes
- The CloudFront distribution uses a provided ACM certificate for HTTPS.
- Ensure the bucket name provided in `variables.tf` is unique globally.

---
