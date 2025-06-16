# --- Cloud Watch Logs ---

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/dev/${aws_ecs_cluster.main.name}/${var.environment}-${var.application}"
  retention_in_days = 30
}