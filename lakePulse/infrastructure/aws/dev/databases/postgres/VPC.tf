data "aws_vpc" "vpc" {
  filter {
    name   = "tag:Name"
    values = [var.ecs_vpc_name]
  }
}


