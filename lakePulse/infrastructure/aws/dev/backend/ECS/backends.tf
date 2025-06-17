terraform {
  backend "s3" {
    bucket         = "lake-pulse-infrastructure"
    key            = "lake-pulse-backend-ecs/terraform.tfstate"
    region         = "us-east-1"  # specify your AWS region
    encrypt        = true
  }
}