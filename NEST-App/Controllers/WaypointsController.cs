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

        //For adding a waypoint to the end of the list
        [HttpGet]
        [Route("api/waypoints/{id}")]
        public async Task<IEnumerable<object>> Waypoints(int id)
        {
            Mission mission = await db.Missions.FindAsync(id);

            var wps = mission.Waypoints;
            List<Waypoint> wpsInOrder = new List<Waypoint>();
            var tail = wps.First(wp => wp.NextWaypoint == null);
            wps.Add(tail);
            foreach (var wp in wps)
            {
                if (wp.Id == tail.Id)
                {
                    //This is already in the list we don't want to insert it.
                    continue;
                }
                var next = wp.NextWaypoint;
                int index = wpsInOrder.FindIndex(n => n.Id == next.Id);
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
                               Position = wp.Position,
                               IsActive = wp.IsActive,
                               Id = wp.Id,
                               TimeCompleted = wp.TimeCompleted,
                               WaypointName = wp.WaypointName
                           };
            return diffType;
        }


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
