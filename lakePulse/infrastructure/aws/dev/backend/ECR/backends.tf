terraform {
  backend "s3" {
    bucket         = "lake-pulse-infrastructure"
    key            = "lake-pulse-backend-ecr/terraform.tfstate"
    region         = "us-east-1" 
    encrypt        = true
  }
}
