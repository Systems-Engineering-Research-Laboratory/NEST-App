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
using System.Web.Http.Description;
using NEST_App.DAL;
using NEST_App.Models;
using NEST_App.Models.DTOs;

namespace NEST_App.Controllers
{
    public class MissionsController : ApiController
    {
        private NestDbContext db = new NestDbContext();

        // GET: api/Missions
        public IQueryable<MissionDTO> GetMissions()
        {
            var missionDtos = from mis in db.Missions
                              select new MissionDTO
                              {
                                  Id = mis.id,
                                  Phase = mis.Phase,
                                  FlightPattern = mis.FlightPattern,
                                  Payload = mis.Payload,
                                  Priority = mis.Priority,
                                  FinancialCost = mis.FinancialCost ?? 0,
                                  UAVId = mis.Schedule.UAVId ?? -1,
                                  TimeAssigned = mis.TimeAssigned,
                                  TimeCompleted = mis.TimeCompleted,
                                  Latitude = mis.DestinationCoordinates.Latitude ?? 0,
                                  Longitude = mis.DestinationCoordinates.Longitude ?? 0,
                                  Altitude = mis.DestinationCoordinates.Elevation ?? 0,
                                  ScheduledCompletionTime = mis.ScheduledCompletionTime,
                                  EstimatedCompletionTime = mis.EstimatedCompletionTime
                              };
            return missionDtos;
        }

        [Route("api/missions/unassignedmissions")]
        [HttpGet]
        public IQueryable<Mission> UnassignedMissions()
        {
            var unassgn = from mis in db.Missions
                          join sched in db.Missions on mis.ScheduleId equals sched.id
                          where mis.Schedule.UAVId == null
                          select mis;
            return unassgn;
        }

        // GET: api/Missions/5
        [ResponseType(typeof(Mission))]
        public async Task<IHttpActionResult> GetMission(int id)
        {
            Mission mission = await db.Missions.FindAsync(id);
            if (mission == null)
            {
                return NotFound();
            }

            return Ok(mission);
        }

        // PUT: api/Missions/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutMission(int id, Mission mission)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != mission.id)
            {
                return BadRequest();
            }

            db.Entry(mission).State = System.Data.Entity.EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MissionExists(id))
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

        // POST: api/Missions
        [ResponseType(typeof(Mission))]
        public async Task<IHttpActionResult> PostMission(Mission mission)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Missions.Add(mission);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = mission.id }, mission);
        }

        // DELETE: api/Missions/5
        [ResponseType(typeof(Mission))]
        public async Task<IHttpActionResult> DeleteMission(int id)
        {
            Mission mission = await db.Missions.FindAsync(id);
            if (mission == null)
            {
                return NotFound();
            }

            db.Missions.Remove(mission);
            await db.SaveChangesAsync();

            return Ok(mission);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool MissionExists(int id)
        {
            return db.Missions.Count(e => e.id == id) > 0;
        }
    }
}