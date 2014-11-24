//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace NEST_App.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Weather
    {
        public int WeatherID { get; set; }
        public string Location { get; set; }
        public string Name_Station { get; set; }
        public string AvgWindSpdMPH { get; set; }
        public string AvgWindDir { get; set; }
        public string MaxWindSpdMPH { get; set; }
        public string WindDiratMax { get; set; }
        public string AvgTempDeg_F { get; set; }
        public string MaxTempDeg_F { get; set; }
        public string MinTempDeg_F { get; set; }
        public string AvgRH_Perc { get; set; }
        public string AvgBarPress_mb { get; set; }
        public string TotalRainInches { get; set; }
        public string AvgSolar_WPerm2 { get; set; }
        public string BattVoltMin { get; set; }
        public string Warning { get; set; }
    
        public virtual MapInformation MapInfo { get; set; }
        public virtual UAV_Warehouse UAV_Utilities { get; set; }
        public virtual RestrictedArea RestrictedArea { get; set; }
    }
}