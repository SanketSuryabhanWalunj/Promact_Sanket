data "aws_subnet" "subnet_public_a_rds" {
  filter {
    name = "tag:Name"
    values = var.subnet_public_a 
  }
}

data "aws_subnet" "subnet_public_b_rds" {

  filter {
    name = "tag:Name"
    values = var.subnet_public_b 
  }
}