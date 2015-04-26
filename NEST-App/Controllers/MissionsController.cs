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
using Microsoft.AspNet.SignalR;
using NEST_App.DAL;
using NEST_App.Models;
using NEST_App.Models.DTOs;
using NEST_App.Hubs;

namespace NEST_App.Controllers
{
    public class MissionsController : ApiController
    {
        private NestContainer db = new NestContainer();

        [HttpGet]
        [Route("api/missions/waypoints/{id}")]
        [ResponseType(typeof(IQueryable<object>))]
        public async Task<IHttpActionResult> Waypoints(int id)
        {
            Mission mission = await db.Missions.FindAsync(id);
            if (mission == null)
            {
                return BadRequest();
            }
            var wps = mission.Waypoints;
            List<Waypoint> wpsInOrder = new List<Waypoint>();
            if (wps.Count == 0)
            {
                return Ok(wpsInOrder.AsQueryable());
            }
            var activeWps = from wp in mission.Waypoints
                            where wp.IsActive
                            select wp;
            var tail = activeWps.First(wp => wp.NextWaypoint == null && wp.IsActive);
            wpsInOrder.Add(tail);
            foreach (var wp in activeWps)
            {
                if (wp.Id == tail.Id)
                {
                    //This is already in the list we don't want to insert it.
                    continue;
                }
                var next = wp.NextWaypoint;
                int index = next != null ? wpsInOrder.FindIndex(n => n.Id == next.Id) : -1;
                if (index == -1)
                {
                    //The next waypoint of this waypoint is not in this list, just insert it behind the last waypoint.
                    int len = wpsInOrder.Count;
                    wpsInOrder.Insert(len - 1, wp);
                }
                else
                {
                    //Insert the waypoint behind its next waypoint.
                    wpsInOrder.Insert(index, wp);
                }

            }

            var diffType = from wp in wpsInOrder.AsQueryable()
                           select new
                           {
                               MissionId = wp.MissionId,
                               NextWaypointId = wp.NextWaypointId,
                               Latitude = wp.Latitude,
                               Longitude = wp.Longitude,
                               Altitude = wp.Altitude,
                               IsActive = wp.IsActive,
                               Id = wp.Id,
                               TimeCompleted = wp.TimeCompleted,
                               WaypointName = wp.WaypointName,
                               Action = wp.Action,
                               GeneratedBy = wp.GeneratedBy,
                           };


            return Ok(diffType);
        }

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
                                  TimeAssigned = mis.TimeAssigned ?? DateTime.Now,
                                  TimeCompleted = mis.TimeCompleted ?? DateTime.Now,
                                  Latitude = mis.Latitude,
                                  Longitude = mis.Longitude,
                                  ScheduledCompletionTime = mis.ScheduledCompletionTime ?? DateTime.Now,
                                  EstimatedCompletionTime = mis.EstimatedCompletionTime ?? DateTime.Now
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

        [Route("api/missions/{id}/updatephase")]
        [ResponseType(typeof(void))]
        [HttpPut]
        public async Task<IHttpActionResult> UpdatePhase(int id, string phase)
        {
            var mis = await db.Missions.FindAsync(id);
            if (mis != null && phase != null)
            {
                mis.Phase = phase;
                db.Entry(mis);
                try
                {
                    await db.SaveChangesAsync();
                }
                catch (Exception e)
                {
                    //Just catch the exception and emit out, that's all we care about
                }

                var hub = GlobalHost.ConnectionManager.GetHubContext<VehicleHub>();
                hub.Clients.All.newMissionPhase(id, phase);
                return Ok();


            }
            else
            {
                return Conflict();
            }
        }

        [Route("api/missions/{id}/newroute")]
        [ResponseType(typeof(void))]
        [HttpPost]
        public async Task<IHttpActionResult> NewRouteForMission(int id, Waypoint[] wps)
        {
            using (var trans = db.Database.BeginTransaction())
            {
                Mission mission = await db.Missions.FindAsync(id);
                if (mission == null)
                {
                    return NotFound();
                }
                if (wps == null || wps.Count() < 1)
                {
                    return BadRequest();
                }
                foreach (var wp in mission.Waypoints)
                {
                    wp.IsActive = false;
                    db.Entry(wp).State = System.Data.Entity.EntityState.Modified;
                }
                await db.SaveChangesAsync();
                await this.addWaypointsToMission(id, wps);

                trans.Commit();
                var hub = GlobalHost.ConnectionManager.GetHubContext<VehicleHub>();
                hub.Clients.All.newRouteForMission(mission.id);

                return Ok(wps);
            }
        }

        [HttpPost]
        [Route("api/missions/{id}/appendWaypoints")]
        public async Task<IHttpActionResult> AppendWaypoints(int id, Waypoint[] wps)
        {
            if (wps.Count() == 0)
            {
                return Ok(wps);
            }
            using (var trans = db.Database.BeginTransaction())
            {
                var wp = await getLastWaypoint(id);
                await this.addWaypointsToMission(id, wps);
                wp.NextWaypointId = wps[0].Id;
                db.Entry(wp).State = System.Data.Entity.EntityState.Modified;
                await db.SaveChangesAsync();

                var hub = GlobalHost.ConnectionManager.GetHubContext<VehicleHub>();
                hub.Clients.All.newRouteForMission(id);

                return Ok(wps);
            }
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

        private async Task addWaypointsToMission(int missionId, Waypoint[] wps)
        {

            var wpLast = wps.Last();
            wpLast.MissionId = missionId;
            wpLast = db.Waypoints.Add(wpLast);
            wpLast.IsActive = true;
            await db.SaveChangesAsync();
            for (int i = wps.Count() - 2; i >= 0; i--)
            {
                var curWp = wps.ElementAt(i);
                curWp.NextWaypointId = wpLast.Id;
                curWp.MissionId = missionId;
                curWp.IsActive = true;
                wpLast = db.Waypoints.Add(curWp);
                await db.SaveChangesAsync();
            }
        }

        private async Task<Waypoint> getLastWaypoint(int missionId)
        {
            var mis = await db.Missions.FindAsync(missionId);
            var last = (from wp in mis.Waypoints
                        where wp.NextWaypoint == null && wp.IsActive
                        select wp).FirstOrDefault();
            return last;
        }
    }
}