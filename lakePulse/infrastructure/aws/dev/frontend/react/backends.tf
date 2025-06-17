terraform {
  backend "s3" {
    bucket         = "lake-pulse-infrastructure"
    key            = "dev/frontend/terraform.tfstate"
    region         = "us-east-1"  # specify your AWS region
    encrypt        = true
  }
}