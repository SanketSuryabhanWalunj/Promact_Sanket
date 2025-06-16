resource "aws_db_instance" "postgresql" {
  identifier        = "${var.rds_pg_db_identifier}-postgresql"
  engine            = "postgres"
  engine_version    = var.rds_pg_engine_version  
  instance_class    = var.rds_pg_instance_type 
  allocated_storage = var.rds_pg_instance_disk_size  

  db_name  = var.rds_pg_db_name 
  username = var.rds_pg_user 
  password = aws_ssm_parameter.rds_password.value 

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name

  backup_retention_period = var.rds_pg_backup_retention_period
  skip_final_snapshot     = true

  publicly_accessible = true

  max_allocated_storage = var.rds_pg_max_allocated_storage

  storage_encrypted = true

  tags = var.rds_pg_db_tags
}

resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "${var.rds_pg_db_name}-rds-subnet-group"
  subnet_ids = [
    data.aws_subnet.subnet_public_a_rds.id,
    data.aws_subnet.subnet_public_b_rds.id
    ]  

  tags = var.rds_pg_db_tags
}

resource "aws_security_group" "rds_sg" {
  name        = "${var.rds_pg_db_name}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = data.aws_vpc.vpc.id  

  ingress {
    description     = "PostgreSQL access from ECS nodes"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.ecs_cluster_nodes_security_group_ids
  }

  tags = var.rds_pg_db_tags
}