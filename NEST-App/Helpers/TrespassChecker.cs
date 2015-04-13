using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using NEST_App.Models;
using NEST_App.Hubs;

namespace NEST_App.Helpers
{
    public class TrespassChecker
    {
        private static NestContainer db = new NestContainer();
        private static List<int> violatingUavs = new List<int>();
        private static IHubContext eventHub = GlobalHost.ConnectionManager.GetHubContext<EventLogHub>();

        public static async Task ReportTrespassIfNecesarry(int uavId, double latitude, double longitude)
        {
            bool shouldReport = ShouldReportOut(uavId, latitude, longitude);
            if(shouldReport)
            {
                await SendTrespassEvent(uavId);
            }
        }

        public static async Task SendTrespassEvent(int uavId)
        {
            var uav = await db.UAVs.FindAsync(uavId);
            EventLog evt = new EventLog();
            evt.uav_id = uav.Id;
            evt.uav_callsign = uav.Callsign;
            evt.criticality = "critical";
            evt.message = uav.Callsign + " Trespassing";
            evt.create_date = DateTime.Now;
            evt.modified_date = DateTime.Now;
            //wtf seriously? -- why is this in here twice...
            evt.UAVId = uav.Id;
            evt.operator_screen_name = "NEST";
            eventHub.Clients.All.newEvent(evt);

            
            db.EventLogs.Add(evt);
            await db.SaveChangesAsync();
            eventHub.Clients.All.newEvent(evt);
        }

        public static bool ShouldReportOut(int uavId, double latitude, double longitude)
        {
            //Check if there is a trespass
            if(IsPointInRestrictedArea(latitude, longitude))
            {
                //If the uav was already found to be trespassing before, just ignore this instance of trespassing
                if(violatingUavs.Contains(uavId))
                {
                    return false;
                }
                //We aren't aware of this instance of trespassing, report out.
                else
                {
                    violatingUavs.Add(uavId);
                    return true;
                }
            }
            //We don't need to track this guy if he is being tracked, remove him from the list
            else if(violatingUavs.Contains(uavId))
            {
                violatingUavs.Remove(uavId);
            }
            return false;
        }

        public static bool IsPointInRestrictedArea(double latitude, double longitude)
        {
            var areas = from a in db.MapRestrictedSet
                        where a.SouthWestLatitude < latitude && latitude < a.NorthEastLatitude
                        && a.SouthWestLongitude < longitude && longitude < a.NorthEastLongitude
                        select a;

            return areas.Count() > 0;
        }
    }
}