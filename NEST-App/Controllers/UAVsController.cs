using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Spatial;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web;
using NEST_App.DAL;
using NEST_App.Models;
using System.IO;
using Newtonsoft.Json.Linq;

namespace NEST_App.Controllers.Api
{
    public class UAVsController : ApiController
    {
        private NestContainer db = new NestContainer();
        private String[] lines = File.ReadAllLines(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Content\\Names.txt"));
        private String[] lines2 = File.ReadAllLines(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Content\\Flowers.txt"));

        //GET: api/uavs/getuavinfo
        [HttpGet]
        [Route("api/uavs/getuavinfo")]
        public HttpResponseMessage GetUAVInfo()
        {
            var uavs = from u in db.UAVs.Include(u => u.FlightStates).Include(u => u.Schedules).Include(u => u.EventLogs)
                       let s = u.Schedules.OrderBy(s => s.create_date).FirstOrDefault()
                       let m = s.Missions.OrderBy(m => m.create_date).FirstOrDefault()
                       select new
                       {
                           Id = u.Id,
                           Mileage = u.Mileage,
                           NumDeliveries = u.NumDeliveries,
                           Callsign = u.Callsign,
                           create_date = u.create_date,
                           modified_date = u.modified_date,
                           MaxVelocity = u.MaxVelocity,
                           MaxAcceleration = u.MaxAcceleration,
                           MaxVerticalVelocity = u.MaxVerticalVelocity,
                           UpdateRate = u.UpdateRate,
                           Schedule = new
                           {
                               Id = s.Id,
                               UAVId = s.UAVId,
                               create_date = s.create_date,
                               modified_date = s.modified_date,
                               Missions = s.Missions,
                           },
                           Mission = new
                           {
                               Phase = m.Phase,
                               FlightPattern = m.FlightPattern,
                               Payload = m.Payload,
                               Priority = m.Priority,
                               FinancialCost = m.FinancialCost,
                               TimeAssigned = m.TimeAssigned,
                               TimeCompleted = m.TimeCompleted,
                               Latitude = m.Latitude,
                               Longitude = m.Longitude,
                               ScheduledCompletionTime = m.ScheduledCompletionTime,
                               EstimatedCompletionTime = m.EstimatedCompletionTime,
                               Id = m.id,
                               ScheduleId = m.ScheduleId,
                               create_date = m.create_date,
                               modified_date = m.modified_date,
                           },
                           FlightState = u.FlightStates.OrderBy(fs => fs.Timestamp).FirstOrDefault(),
                           EventLog = u.EventLogs,
                       };
            return Request.CreateResponse(HttpStatusCode.OK, uavs);
        }

        private DbGeography getDistance()
        {
            int alt = 400;                                  //altitude of UAV with 400 ft default
            double homeLat = 34.2417;                       //default home latitude
            double homeLon = -118.529;                      //default home longitude
            double radius = 8050;                           //meters (5 miles)
            Random rand = new Random();                     //random number generator
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

        private string getName()
        {
            //string userPath = AppDomain.CurrentDomain.BaseDirectory;
            //string filePath = Path.Combine(userPath, "Content\\Names.txt");
            //var lines = File.ReadAllLines(filePath);
            var rand = new Random();
            var randomLineNumber = rand.Next(0, lines.Length - 1);
            var line = lines[randomLineNumber];
            return line;
        }

        private string getPackage()
        {
            //string userPath = AppDomain.CurrentDomain.BaseDirectory;
            //string filePath = Path.Combine(userPath, "Content\\Flowers.txt");
            //var lines = File.ReadAllLines(filePath);
            var rand = new Random();
            var randomLineNumber = rand.Next(0, lines2.Length - 1);
            var line = lines2[randomLineNumber];
            return line;
        }
        
        [HttpGet]
        [Route("api/uavs/generateuavs/{number}")]
        public IHttpActionResult generateUAVs(int number)
        {
            Random num = new Random();
            for (int i = 0; i < number; i++)
            {
                UAV uav = new UAV
                {
                    Callsign = getName().ToUpper() + num.Next(1, 99),
                    NumDeliveries = num.Next(1, 2000),
                    Mileage = num.Next(1, 100),
                    Id = i,
                    create_date = DateTime.Now,
                    modified_date = DateTime.Now,
                    MaxAcceleration = 20,
                    MaxVelocity = 20,
                    MaxVerticalVelocity = 20,
                    MinDeliveryAlt = 100,
                    UpdateRate = 1000,
                    CruiseAltitude = 400,
                    isActive = true
                };

                Configuration config = new Configuration
                {
                    Classification = "Predator",
                    create_date = DateTime.Now,
                    modified_date = DateTime.Now,
                    Name = "Default",
                    NumberOfMotors = 4
                };
                var flights = new List<FlightState>
                {
                   new FlightState { 
                       Longitude = -118.529,
                       Latitude = 34.2417,
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
                       BatteryLevel = (num.Next(1,99) / 100), 
                       UAVId = i
                   },    
               };
                flights.ForEach(f =>
                {
                    f.Timestamp = DateTime.Now;
                    f.create_date = DateTime.Now;
                    f.modified_date = DateTime.Now;
                });

                DateTime dateValue = new DateTime();
                dateValue = DateTime.Now;
                var randPoint = getDistance();
                var mission = new List<Mission> 
                { 
                   new Mission {
                       Phase = "enroute", 
                       FlightPattern = "abstract",
                       Payload = getPackage(), 
                       Priority = 1, 
                       FinancialCost = num.Next(1, 99), 
                       TimeAssigned = dateValue, 
                       TimeCompleted = dateValue.AddHours(0.0833),  
                       Latitude = randPoint.Latitude?? 34.2417,
                       Longitude = randPoint.Longitude?? -118.529,
                       ScheduledCompletionTime = dateValue.AddHours(0.0899),
                       EstimatedCompletionTime = dateValue.AddHours(0.09), 
                       create_date = dateValue.AddHours(0.01),
                       modified_date = dateValue.AddHours(0.02) 
                  }
               };

                var sched = new List<Schedule>
                { 
                   new Schedule {
                       UAV = uav,
                       //Maintenances = maintenances,
                       Missions = mission,
                       create_date = DateTime.Now,
                       modified_date = DateTime.Now
                   }
                };

                uav.Configurations = config;
                uav.FlightStates = flights;
                uav.Schedules = sched;

                db.UAVs.Add(uav);
                db.Missions.Add(mission.First());
                db.Configurations.Add(config);
                db.Schedules.Add(sched.First());

                try
                {
                    db.SaveChanges();    
                }
                catch (DbUpdateException e)
                {
                    Console.Write(e.Entries);
                }
            }
            var drones = from u in db.UAVs.Include(u => u.FlightStates)
                         select new
                         {
                             Id = u.Id,
                             Mileage = u.Mileage,
                             NumDeliveries = u.NumDeliveries,
                             Callsign = u.Callsign,
                             create_date = u.create_date,
                             modified_date = u.modified_date,
                             MaxVelocity = u.MaxVelocity,
                             MaxAcceleration = u.MaxAcceleration,
                             MaxVerticalVelocity = u.MaxVerticalVelocity,
                             UpdateRate = u.UpdateRate,
                             FlightState = u.FlightStates.OrderBy(fs => fs.Timestamp).FirstOrDefault(),
                             EventLog = u.EventLogs
                         };
            return Ok(drones);
        }

        [HttpPost]
        [Route("api/uavs/postuavevent")]
        public void PostUavEvent(EventLog evnt)
        {
            evnt.create_date = DateTime.Now;
            evnt.modified_date = DateTime.Now;
            db.EventLogs.Add(evnt);
            db.SaveChanges();
        }


        // GET: api/UAVs
        public IQueryable<UAV> GetUAVs()
        {
            return db.UAVs.Where(u => u.isActive == true);
        }

        // GET: api/UAVs/5
        [ResponseType(typeof(UAV))]
        public async Task<IHttpActionResult> GetUAV(int id)
        {
            UAV uAV = await db.UAVs.FindAsync(id);
            if (uAV == null)
            {
                return NotFound();
            }

            return Ok(uAV);
        }

        // PUT: api/UAVs/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutUAV(int id, UAV uAV)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != uAV.Id)
            {
                return BadRequest();
            }

            db.Entry(uAV).State = System.Data.Entity.EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UAVExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/UAVs
        [ResponseType(typeof(UAV))]
        public async Task<IHttpActionResult> PostUAV(UAV uAV)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.UAVs.Add(uAV);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = uAV.Id }, uAV);
        }

        // DELETE: api/UAVs/5
        [ResponseType(typeof(UAV))]
        public async Task<IHttpActionResult> DeleteUAV(int id)
        {
            UAV uAV = await db.UAVs.FindAsync(id);
            if (uAV == null)
            {
                return NotFound();
            }

            db.UAVs.Remove(uAV);
            await db.SaveChangesAsync();

            return Ok(uAV);
        }
        [ResponseType(typeof(IEnumerable<UAV>))]
        [HttpGet]
        [Route("api/uavs/getunassigned")]
        public IHttpActionResult getUnassigned()
        {
            IEnumerable<UAV> uavs = db.UAVs.Where(u => u.User == null && u.isActive);
            return Ok(uavs);
        }

        [ResponseType(typeof(UAV))]
        [HttpPost]
        [Route("api/uavs/assignuser/{uav_id}/{user_id}")]
        public async Task<IHttpActionResult> assignUser(int uav_id, int user_id)
        {
            UAV uav = await db.UAVs.FindAsync(uav_id);
            User user = await db.Users.FindAsync(user_id);
            if (uav == null || user == null)
            {
                return NotFound();
            }
            uav.User = user;
            user.UAVs.Add(uav);
            db.Entry(uav).State = System.Data.Entity.EntityState.Modified;
            db.Entry(user).State = System.Data.Entity.EntityState.Modified;
            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
            return Ok(uav);
        }

        [ResponseType(typeof(UAV))]
        [HttpPut]
        [Route("api/uavs/disableuav/{id}")]
        public async Task<IHttpActionResult> disableUAV(int id)
        {
            UAV uav = await db.UAVs.FindAsync(id);
            if (uav == null)
            {
                return NotFound();
            }
            uav.isActive = false;


            db.Entry(uav).State = System.Data.Entity.EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UAVExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(uav);
            
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UAVExists(int id)
        {
            return db.UAVs.Count(e => e.Id == id) > 0;
        }
    }
}