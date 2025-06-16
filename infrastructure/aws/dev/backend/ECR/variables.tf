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
