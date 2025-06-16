resource "aws_ecr_repository" "app" {
  name                 = "${var.environment}/${var.application}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = false
  }


  tags = {
    Environment = "${var.environment}"
    Team        = "DevOps"
    Project     = "${var.application}"
  }

}

output "app_repo_url" {
  value = aws_ecr_repository.app.repository_url
}