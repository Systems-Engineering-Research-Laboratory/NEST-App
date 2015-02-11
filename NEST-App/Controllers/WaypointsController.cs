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


        //for inserting a waypoint
        [HttpGet]
        [Route("api/waypoints/{id}/{lat}/{lng}/{wp}")]
        public async Task<IEnumerable<object>> Waypoints(int id, double lat, double lng, Waypoint wp)
        {
            Mission mission = await db.Missions.FindAsync(id);
            var wps = mission.Waypoints;

            var nextWaypoint = wp.NextWaypoint;

            wp.NextWaypoint = new Waypoint
            {
                MissionId = wp.MissionId,
                //NextWaypointId = wp.NextWaypointId,  how are wps assigned an ID?
                Position = DbGeography.FromText("POINT(" + lat + " " + lng + ")"),
                IsActive = wp.IsActive,
                WasSkipped = wp.WasSkipped,
                //GeneratedBy = operator that created it
                //Id = wp.Id,    what is the new id? related to how wps are assigned an ID
                Action = wp.Action, //This is temporary; it may be possible that we set a waypoint at which the drone should hold
                WaypointName = "Inserted Waypoint",
                NextWaypoint = nextWaypoint,
                Missions = wp.Missions
            };
            

            return wps; //this list includes the new, inserted waypoint

        }
        
    }
}
