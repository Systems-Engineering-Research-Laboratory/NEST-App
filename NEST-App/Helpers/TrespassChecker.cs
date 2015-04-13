using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NEST_App.Models;
using System.Threading.Tasks;

namespace NEST_App.Helpers
{
    public class TrespassChecker
    {
        private static NestContainer db = new NestContainer();
        private static List<int> violatingUavs = new List<int>();

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