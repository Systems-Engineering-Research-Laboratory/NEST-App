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

namespace NEST_App.Controllers.Api
{
    public class UAVsController : ApiController
    {
        private NestContainer db = new NestContainer();

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
                               DestinationCoordinates = m.DestinationCoordinates,
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
        [HttpGet]
        [Route("api/uavs/getgenerateduavs")]
        public HttpResponseMessage getGeneratedUavs()
        {
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
            return Request.CreateResponse(HttpStatusCode.OK, drones);
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
            string userPath = AppDomain.CurrentDomain.BaseDirectory;
            string filePath = Path.Combine(userPath, "Content\\Names.txt");
            var lines = File.ReadAllLines(filePath);
            var rand = new Random();
            var randomLineNumber = rand.Next(0, lines.Length - 1);
            var line = lines[randomLineNumber];
            return line;
        }

        private string getPackage()
        {
            string userPath = AppDomain.CurrentDomain.BaseDirectory;
            string filePath = Path.Combine(userPath, "Content\\Flowers.txt");
            var lines = File.ReadAllLines(filePath);
            var rand = new Random();
            var randomLineNumber = rand.Next(0, lines.Length - 1);
            var line = lines[randomLineNumber] + lines[randomLineNumber] + lines[randomLineNumber];
            return line;
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
            return db.UAVs;
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