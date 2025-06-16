# Please change the default names as per your requirements.

variable "aws_profile" {
  description = "AWS profile name"
  default = "default"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  default = "us-east-1"
  type        = string
}

variable "environment" {
  description = "Environment name"
  default = "dev"
  type        = string
}

variable "application" {
  description = "Application name"
  default = "lp-backend"
  type        = string
}
# variable "bucket_name" {
#   default = "my-bucket"
#   type = string
# }

# variable "created_by" {
#   default = "DevOps" 
#   type = string
# }

# variable "object_ownership" {
#   default = "BucketOwnerPreferred"
#   type = string
# }

variable "key_pair_name" {
  description = "The name of the existing EC2 key pair to use"
  default = "develop-env"
  type        = string
}

variable "acm_cert_arn" {
  description = "AWS ACM Certificate ARN"
  default = "arn:aws:acm:us-east-1:699475921536:certificate/25a8a0de-5795-4805-8270-de518b5af9af"
  type        = string
}

variable "ecr_image_uri" {
  description = "AWS ECR URI"
  default = "699475921536.dkr.ecr.us-east-1.amazonaws.com/dev/lp-backend:5583237d4bf36471dcf94d14f86a26995afa942b"
  type        = string
}