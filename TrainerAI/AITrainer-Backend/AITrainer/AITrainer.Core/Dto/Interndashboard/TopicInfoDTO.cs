using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.Interndashboard
{
    public class TopicInfoDTO
    {
        public Topic  Topics { get; set; }

        //public List<AssignmentInfoDto>? Assignment { get; set; }
        public List<InternAssignmentInfoDto>? Assignment { get; set; }
        public DateTime TopicStartDate { get; set; }
        public DateTime? TopicEndDate { get; set; }
    }
}
