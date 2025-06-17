using System;
using System.Collections.Generic;

namespace VirtaulAid.DTOs.Course
{
    public class ReqAddModuleDto
    {
        public Guid courseId {  get; set; }
        public int SrNo { get; set; }
        public string Name { get; set; }
        public List<string> Lessons { get; set; }
    }
}
