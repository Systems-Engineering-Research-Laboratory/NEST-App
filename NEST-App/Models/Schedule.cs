//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace NEST_App.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Schedule
    {
        public Schedule()
        {
            this.Missions = new HashSet<Mission>();
            this.Maintenances = new HashSet<Maintenance>();
        }
    
        public int Id { get; set; }
        public Nullable<int> UAVId { get; set; }
        public System.DateTime create_date { get; set; }
        public System.DateTime modified_date { get; set; }
        public Nullable<int> CurrentMission { get; set; }
    
        public virtual UAV UAV { get; set; }
        public virtual ICollection<Mission> Missions { get; set; }
        public virtual ICollection<Maintenance> Maintenances { get; set; }
    }
}
