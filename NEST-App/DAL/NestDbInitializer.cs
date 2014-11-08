using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.Data.Entity.Spatial;
using NEST_App.Models;

namespace NEST_App.DAL
{
    public class NestDbInitializer : System.Data.Entity.DropCreateDatabaseAlways<NestDbContext>
    {
        protected override void Seed(NestDbContext context)
        {
            var UAVs = new List<UAV>
            {
                new UAV{Callsign = "HAWK21", NumDeliveries = 2134, Mileage = 234}
            };
            UAVs.ForEach(s => context.OwnshipVehicles.Add(s));

            var FlightStates = new List<FlightState>
            {
                new FlightState{
                    //Position = DbGeography.FromText("POINT(34.2365205,-118.5002736)"),
                    VelocityX = 0,
                    VelocityY = 0,
                    VelocityZ = 0,
                    Yaw = 0,
                    Roll = 0,
                    Pitch = 0,
                    YawRate = 0,
                    RollRate = 0,
                    PitchRate = 0,
                    BatteryLevel = .94
                }
            };
            FlightStates.ForEach(s =>
            {
                s.Timestamp = DateTime.Now;
                context.FlightStates.Add(s);
            });
            context.SaveChanges();
        }
    }
}