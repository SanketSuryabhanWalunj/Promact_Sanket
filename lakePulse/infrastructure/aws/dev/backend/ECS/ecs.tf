# --- ECS Cluster ---

resource "aws_ecs_cluster" "main" {
  name = "${var.environment}-${var.application}-cluster"
}