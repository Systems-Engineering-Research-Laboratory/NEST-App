using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace NEST_App.Models.DTOs
{
    public class MissionDTO
    {
        public int Id { get; set; }
        public string Phase { get; set; }
        public string FlightPattern { get; set; }
        public string Payload { get; set; }
        public int Priority { get; set; }
        public decimal FinancialCost { get; set; }
        public int UAVId { get; set; }
        public System.DateTime TimeAssigned { get; set; }
        public System.DateTime? TimeCompleted { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Altitude { get; set; }
        public System.DateTime ScheduledCompletionTime { get; set; }
        public System.DateTime EstimatedCompletionTime { get; set; }
    }
}