using Microsoft.AspNetCore.Mvc;
using Org.BouncyCastle.Bcpg.OpenPgp;

namespace AITrainer.AITrainer.Core.Dto.Internship
{
    public class FeedbackResponse
    {
        public FileContentResult File {  get; set; }
        public string FileName { get; set; }
    }
}
