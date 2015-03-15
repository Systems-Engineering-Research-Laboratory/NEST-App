using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Routing;
using System.Web.Http.Description;
using Microsoft.AspNet.SignalR;
using NEST_App.Models;
using NEST_App.DAL;
using NEST_App.Hubs;

namespace NEST_App.Controllers
{
    public class ScheduleController : ApiController
    {
        private NestContainer db = new NestContainer();


        /* ****
         * send me a series of uav id's batched and i will return a schedule for each uavid sent.
         * uav id's must be valid or it will dberror
         * **** */
        // POST api/Schedule/GenerateScheduleForUAV
        public Schedule GenerateScheduleForUAV(int uavID)
        {
            var sched = new Schedule
            {
                UAVId = uavID,
                Maintenances = new List<Maintenance>() {
                    new Maintenance
                    {   last_maintenance = DateTime.Now.AddHours(-1.0f),
                        next_maintenance = DateTime.Now.AddHours(5.0f),
                        time_remaining = (DateTime.Now.AddHours(5.0f) - DateTime.Now).ToString(),    }},
                Missions = new List<Mission>()
                {
                    new Mission
                    {
                        EstimatedCompletionTime = DateTime.Now.AddHours(0.5f),
                        FinancialCost = (decimal)5,
                        FlightPattern = (string)@"zigzag",
                        Payload = (string)@"500lbs",
                        Priority = 3,
                        ScheduledCompletionTime = DateTime.Now.AddHours(0.7f),
                        TimeAssigned = DateTime.Now.AddHours(-0.1f),
                        TimeCompleted = DateTime.Now,
                        Phase = (string)@"En route",
                        Longitude = -117.861328,
                        Latitude = 34.089061
                    }
                },
            };
            try
            {
                db.Schedules.Add(sched);
                db.SaveChanges();
            }
            catch (DbUpdateException incandescent)
            {
                //return null;
            }

            return sched;
        }

        [HttpPut]
        [Route("api/schedule/{id}/setCurrentMission/{missionId}")]
        public async Task<IHttpActionResult> setCurrentMission(int id, int missionId)
        {
            var sched = await db.Schedules.FindAsync(id);
            var mission = await db.Missions.FindAsync(missionId);
            mission.ScheduleId = sched.Id;
            sched.CurrentMission = mission.id;
            db.Entry(mission).State = System.Data.Entity.EntityState.Modified;
            db.Entry(sched).State = System.Data.Entity.EntityState.Modified;
            await db.SaveChangesAsync();

            var hub = GlobalHost.ConnectionManager.GetHubContext<VehicleHub>();
            hub.Clients.All.vehicleHasNewMission(sched.UAVId, id, missionId);

            return Ok();
        }


        // GET api/Schedule
        public IQueryable<Schedule> GetSchedules()
        {
            return db.Schedules;
        }

        // GET api/Schedule/5
        [ResponseType(typeof(Schedule))]
        public IHttpActionResult GetSchedule(int id)
        {
            Schedule schedule = db.Schedules.Find(id);
            if (schedule == null)
            {
                return NotFound();
            }

            return Ok(schedule);
        }

        // PUT api/Schedule/5
        public IHttpActionResult PutSchedule(int id, Schedule schedule)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != schedule.Id)
            {
                return BadRequest();
            }

            db.Entry(schedule).State = System.Data.Entity.EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScheduleExists(id))
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

        // POST api/Schedule
        [ResponseType(typeof(Schedule))]
        public IHttpActionResult PostSchedule(Schedule schedule)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Schedules.Add(schedule);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = schedule.Id }, schedule);
        }

        // DELETE api/Schedule/5
        [ResponseType(typeof(Schedule))]
        public IHttpActionResult DeleteSchedule(int id)
        {
            Schedule schedule = db.Schedules.Find(id);
            if (schedule == null)
            {
                return NotFound();
            }

            db.Schedules.Remove(schedule);
            db.SaveChanges();

            return Ok(schedule);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ScheduleExists(int id)
        {
            return db.Schedules.Count(e => e.Id == id) > 0;
        }
    }
}