provider "aws" {
  region    = var.region
}


terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.17.0"
    }
  }
  backend "s3" {
    bucket         = "lake-pulse-infrastructure"
    key            = "dev/lake-pulse-pgdb/terraform.tfstate"
    region         = "us-east-1" 
    encrypt        = true
  }
}
