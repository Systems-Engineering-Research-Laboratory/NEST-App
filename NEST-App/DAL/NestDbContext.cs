using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using NEST_App.Models;

namespace NEST_App.DAL
{
    public class NestDbContext : DbContext
    {

        public NestDbContext() : base("NestDbContext")
        {
            base.Configuration.ProxyCreationEnabled = false;
        }

        public DbSet<UAV> UAVs { get; set; }
        public DbSet<NonownshipVehicle> NonownshipVehicles { get; set; }
        public DbSet<Configuration> Configurations { get; set; }
        public DbSet<Equipment> EquipmentList { get; set; }
        public DbSet<EquipmentHealth> EquipmentHealthList { get; set; }
        public DbSet<FlightState> FlightStates { get; set; }
        public DbSet<Mission> Missions { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<Maintenance> Maintenances { get; set; }

        public virtual DbSet<CMD_NAV_Waypoint> CMD_NAV_Waypoint { get; set; }
        public virtual DbSet<CMD_NAV_Takeoff> CMD_NAV_Takeoff { get; set; }
        public virtual DbSet<CMD_CONDITION_Rates> CMD_CONDITION_Rates { get; set; }
        public virtual DbSet<CMD_NAV_Target> CMD_NAV_Target { get; set; }
        public virtual DbSet<CMD_NAV_Set_Base> CMD_NAV_Set_Base { get; set; }
        public virtual DbSet<CMD_NAV_Land> CMD_NAV_Land { get; set; }
        public virtual DbSet<CMD_ACK> CMD_ACK { get; set; }
        public virtual DbSet<CMD_NAV_Hold> CMD_NAV_Hold { get; set; }
        public virtual DbSet<CMD_NAV_Return> CMD_NAV_Return { get; set; }


        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }


    }
}