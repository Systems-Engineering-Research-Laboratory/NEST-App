using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Spatial;
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
    public class WaypointsController : ApiController
    {
        private NestContainer db = new NestContainer();

        [HttpGet]
        [Route("api/waypoints/{id}")]
        [ResponseType(typeof(Waypoint))]
        public async Task<IHttpActionResult> GetWaypoint(int id)
        {
            var wp = await db.Waypoints.FindAsync(id);
            if (wp == null)
            {
                return NotFound();
            }
            return Ok(wp);
        }

        //for inserting a waypoint
        [HttpPost]
        [Route("api/waypoints/insert/{id}")]
        public async Task<IHttpActionResult> Waypoints(int id, Waypoint newWp)
        {
            //Use a transaction because we have to make possibly 2 commits to the database. If
            //either fails, we need to roll back
            using (var trans = db.Database.BeginTransaction())
            {
                try
                {
                    Mission mission = await db.Missions.FindAsync(id);
                    //If the mission doesn't exist, or the input parameter doesn't match the stored mission id, then return bad request
                    //The auto-generated WebApi2 
                    if (mission == null && newWp.MissionId != id)
                    {
                        return BadRequest("The Mission was not found and the waypoint was null");
                    }

                    newWp = db.Waypoints.Add(newWp);
                    await db.SaveChangesAsync();
                    var wps = mission.Waypoints;
                    //Try to get the nextWaypoint id
                    var nextPointId = newWp.NextWaypointId;
                    //If nextPointId is not null, fix the reference of the former previous waypoint
                    if (nextPointId != null)
                    {
                        Waypoint prevWp = (from wp in mission.Waypoints
                                           where wp.NextWaypointId == nextPointId
                                           select wp).First();
                        if (prevWp != null)
                        {
                            prevWp.NextWaypoint = newWp;
                            //This waypoint is now modified. Let the context know.
                            db.Entry(prevWp).State = System.Data.Entity.EntityState.Modified;
                            await db.SaveChangesAsync();
                        }
                    }
                    //We finished with the transactions, make sure to commit them.
                    trans.Commit();
                    return Ok();
                }
                catch (DbUpdateException e)
                {
                    //Something went wrong. Rollback any changes, if any.
                    trans.Rollback();
                    return BadRequest();
                }

            }
        }

    }
}
