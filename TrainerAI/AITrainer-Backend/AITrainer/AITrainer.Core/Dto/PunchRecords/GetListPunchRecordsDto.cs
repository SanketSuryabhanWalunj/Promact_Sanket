using AITrainer.AITrainer.DomainModel.Models;

namespace AITrainer.AITrainer.Core.Dto.PunchRecords
{
    public class GetListPunchRecordsDto
    {
       public List<ListPunchRecordsDto>? punchRecords {  get; set; }  
        public List<LeavePunchDto>? leavePunchRecords { get; set;}
        public List<PunchRequestStartEndDateDto>? punchRequestStartEndDateDtos { get; set; }  
        public InternBatchDto IsBatch { get; set; }

    }
    public class InternBatchDto
    {
        public string BatchName { get; set; }
        public List<string> WeekdaysNames { get; set; }
    }
}
