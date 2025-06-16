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

variable "bucket_name" {
  default = "my-bucket"
  type = string
}

variable "created_by" {
  default = "DevOps" 
  type = string
}

variable "object_ownership" {
  default = "BucketOwnerPreferred"
  type = string
}

variable "domain_urls" {
  type = list(string)
  default = [ "admin-dev.lakepulse.co" ]
}