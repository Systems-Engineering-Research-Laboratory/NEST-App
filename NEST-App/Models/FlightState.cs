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
    
    public partial class FlightState
    {
        public int Id { get; set; }
        public System.DateTime Timestamp { get; set; }
        public System.Data.Entity.Spatial.DbGeography Position { get; set; }
        public double VelocityX { get; set; }
        public double VelocityY { get; set; }
        public double VelocityZ { get; set; }
        public double Yaw { get; set; }
        public double Roll { get; set; }
        public double Pitch { get; set; }
        public double YawRate { get; set; }
        public double RollRate { get; set; }
        public double PitchRate { get; set; }
        public double BatteryLevel { get; set; }
    
        public virtual UAV Vehicle { get; set; }
    }
}
