resource "random_password" "rds_password" {
  length  = 45
  special = false
}

resource "aws_ssm_parameter" "rds_password" {
  name  = "/dev/db/${var.rds_pg_db_name}/${var.rds_pg_user}/rds_password"
  type  = "SecureString"
  value = random_password.rds_password.result
}

