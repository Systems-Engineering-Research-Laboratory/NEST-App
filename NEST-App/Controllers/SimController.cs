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
using System.Web.Mvc;
using System.Web;
using NEST_App.DAL;
using NEST_App.Models;
namespace NEST_App.Controllers
{
    public class SimController : Controller
    {
        // GET: Sim
        public ActionResult Index()
        {
            return View();
        }
    }
}

namespace NEST_App.Controllers.Api
{
    public class SimApiController : ApiController
    {

        private NestContainer db = new NestContainer();
        public HttpResponseMessage GetInitSim()
        {
            var uavs = from u in db.UAVs.Include(u => u.FlightStates).Include(u => u.Schedules)
                       let s = u.Schedules.OrderBy(s => s.create_date).FirstOrDefault()
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
                           FlightState = u.FlightStates.OrderBy(fs => fs.Timestamp).FirstOrDefault(),
                       };
                return Request.CreateResponse(HttpStatusCode.OK, uavs);
            
        }
    }
}
