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
        private NestDbContext db = new NestDbContext();

        public HttpResponseMessage GetInitSim()
        {
            var uavs = from u in db.UAVs
                       join s in db.Schedules on u.Id equals s.UAVId.Value
                       join m in db.Missions on s.Id equals m.ScheduleId
                       join fs in db.FlightStates on u.Id equals fs.UAVId
                       select new
                       {
                           Id = u.Id,
                           Mileage = u.Mileage,
                           NumDeliveries = u.NumDeliveries,
                           Callsign = u.Callsign,
                           create_date = u.create_date,
                           modified_date = u.modified_date,
                           Schedule = new 
                           {
                               Id = s.Id,
                               UAVId = s.UAVId,
                               create_date = s.create_date,
                               modified_date = s.modified_date,
                               Missions = s.Missions,
                           },
                           FlightState = fs,
                       };

            return Request.CreateResponse(HttpStatusCode.OK, uavs);
        }
    }
}
