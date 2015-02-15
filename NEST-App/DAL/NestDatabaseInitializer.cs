using System;
using System.Diagnostics;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NEST_App.Models;
using System.Data.Entity.Spatial;
using System.Data;
using System.Data.Entity.Validation;
using System.Data.Entity;

namespace NEST_App.DAL
{
    public class NestDatabaseInitializer : IDatabaseInitializer<NestContainer>
    {
        //Calculates a random point within a 5 mile radius of homeLat/homeLon
        public DbGeography distance()
        {
            int alt = 400;                                  //altitude of UAV with 400 ft default
            double homeLat = 34.2417;                       //default home latitude
            double homeLon = -118.529;                      //default home longitude
            double radius = 8050;                           //meters (5 miles)
            Random rand = new Random();
            double radiusDegrees = radius / 111300f;        //convert meters to degrees, from the equator, 111300 meters in 1 degree
            double lat2 = rand.NextDouble();                //random double latitude
            double lon2 = rand.NextDouble();                //random double longitude
            double w = radiusDegrees * Math.Sqrt(lat2);
            double t = 2 * Math.PI * lon2;
            double x = w * Math.Cos(t);
            double y = w * Math.Sin(t);

            double newX = x / Math.Cos(homeLat);

            double newLon = newX + homeLon;
            double newLat = y + homeLat;

            string point = "POINT(" + newLon.ToString() + " " + newLat.ToString() + " " + alt.ToString() + ")";
            return DbGeography.FromText(point);
        }

        void IDatabaseInitializer<NestContainer>.InitializeDatabase(NestContainer context)
        {
            context.Database.CreateIfNotExists();

            if (context.UAVs.Count() == 0)
            {
                Random num = new Random();
               
                    var UAVs = new List<UAV>
                    {
                        new UAV { 
                            Callsign = "HAWK" + num.Next(1, 99),
                            NumDeliveries = num.Next(1, 2000), 
                            Mileage = num.Next(1, 100),
                            Id = 0, 
                            create_date = DateTime.Now, 
                            modified_date = DateTime.Now, 
                            MaxAcceleration = 20, 
                            MaxVelocity = 20, 
                            MaxVerticalVelocity = 20, 
                            MinDeliveryAlt = 100, 
                            UpdateRate = 1000, 
                            CruiseAltitude = 400,
                            isActive = true
                        }
                    };
                        UAVs[0].Configurations = new Configuration
                        {
                            Classification = "Predator",
                            create_date = DateTime.Now,
                            modified_date = DateTime.Now,
                            Name = "Default",
                            NumberOfMotors = 4
                        };

                        var FlightStates = new List<FlightState>
                        {
                            new FlightState { 
                                Latitude = 34.2417,
                                Longitude = -118.529,
                                Altitude = 400,
                                VelocityX = 0, 
                                VelocityY = 0, 
                                VelocityZ = 0, 
                                Yaw = 0, 
                                Roll = 0, 
                                Pitch = 0, 
                                YawRate = 0, 
                                RollRate = 0, 
                                PitchRate = 0, 
                                BatteryLevel = .19, 
                                UAVId = 1 
                            },    
                         };
                        FlightStates.ForEach(s =>
                        {
                            s.Timestamp = DateTime.Now;
                            s.create_date = DateTime.Now;
                            s.modified_date = DateTime.Now;
                        });

                        UAVs[0].FlightStates = FlightStates;
                        DateTime dateValue = new DateTime();
                        dateValue = DateTime.Now;

                        var randPoint = this.distance();

                        var missions = new List<Mission>
                        {
                            new Mission { 
                                Phase = "enroute", 
                                FlightPattern = "abstract", 
                                Payload = "cheetos", 
                                Priority = 1, 
                                FinancialCost = 40, 
                                TimeAssigned = dateValue, 
                                TimeCompleted = dateValue.AddHours(0.0833), 
                                //DestinationCoordinates = DbGeography.FromText("POINT(-118.52529 34.241670 400)"),  
                                Latitude = randPoint.Latitude?? 34.2417,
                                Longitude = randPoint.Longitude?? -118.529,
                                ScheduledCompletionTime = dateValue.AddHours(0.0899),
                                EstimatedCompletionTime = dateValue.AddHours(0.09), 
                                create_date = dateValue.AddHours(0.01),
                                modified_date = dateValue.AddHours(0.02) }
                        };

                        var RestrictedArea = new List<MapRestricted>
                        {
                            new MapRestricted {
                                //Northridge fashion center is off limits
                                NorthEastLatitude = 34.242679, //Plummer and Tampa
                                NorthEastLongitude = -118.553445,
                                SouthWestLatitude = 34.235456, //Corbin and Nordhoff
                                SouthWestLongitude = -118.562361,
                                Creator = "NEST",
                                Ceiling = 9999,
                                TimeCreated = DateTime.Now,
                                TimeEnds = DateTime.Now.AddDays(1),
                                ReasonCreated = "Test", 
                                Warning = true}
                            };

                        var wps = new List<Waypoint>
                        {
                            new Waypoint { 
                                WaypointName = "Jeff's Next Next Waypoint", 
                                IsActive = true,
                                WasSkipped = false, 
                                GeneratedBy = "Jeff", 
                                Action = "Fly Through", 
                                Latitude = 34.2365205,
                                Longitude = -118.4902736,
                                Altitude = 400,
                                Missions = missions[0]
                            },
                            new Waypoint { 
                                WaypointName = "Jeff's Waypoint", 
                                IsActive = true, WasSkipped = false, 
                                GeneratedBy = "Jeff", 
                                Action = "Fly Through", 
                                Latitude = 34.2417,
                                Longitude = -118.529,
                                Altitude = 400,
                                Missions = missions[0] 
                            },
                            new Waypoint { 
                                WaypointName = "Jeff's Next Waypoint", 
                                IsActive = true, 
                                WasSkipped = false, 
                                GeneratedBy = "Jeff", 
                                Action = "Fly Through", 
                                Latitude = 34.217,
                                Longitude = -118.529,
                                Altitude = 400,
                                Missions = missions[0]}
                            };
                        
                            wps[1].NextWaypoint = wps[2];
                            wps[2].NextWaypoint = wps[0];
                            context.Waypoints.AddRange(wps);

                        var maintenances = new List<Maintenance>
                        {
                            new Maintenance
                            {
                                create_date = DateTime.Now.AddHours(-8),
                                last_maintenance = DateTime.Now.AddHours(-3),
                                modified_date = DateTime.Now,
                                next_maintenance = DateTime.Now.AddHours(5),
                                time_remaining = "55"
                            }
                        };

                        var schedules = new List<Schedule>
                        { 
                            new Schedule {
                                UAV = UAVs.First(),
                                //Maintenances = maintenances,
                                //Missions = missions,
                                create_date = DateTime.Now,
                                modified_date = DateTime.Now
                           }
                        };
                        try
                        {
                            missions.First().Schedule = schedules.First();
                            maintenances.First().Schedule = schedules.First();
                            UAVs.First().Schedules = schedules;
                            //context.FlightStates.Add(FlightStates.First());
                            //context.UAVs.Add(UAVs.First());
                            //context.Missions.Add(missions.First());
                            //context.Maintenances.Add(maintenances.First());
                            context.Schedules.Add(schedules.First());
                            context.MapRestrictedSet.AddRange(RestrictedArea);
                            context.SaveChanges();
                        }
                        catch (DbEntityValidationException e)
                        {
                            foreach (var eve in e.EntityValidationErrors)
                            {
                                System.Diagnostics.Debug.WriteLine("Entity of type \"{0}\" in state \"{1}\" has the following validation errors:",
                                    eve.Entry.Entity.GetType().Name, eve.Entry.State);
                                foreach (var ve in eve.ValidationErrors)
                                {
                                    System.Diagnostics.Debug.WriteLine("- Property: \"{0}\", Error: \"{1}\"",
                                        ve.PropertyName, ve.ErrorMessage);
                                }
                            }
                            throw;
                        }       
                  }
            }
      }
}