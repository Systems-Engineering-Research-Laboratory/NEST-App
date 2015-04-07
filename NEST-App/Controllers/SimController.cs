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

    public class TransferObject
    {
        public int Id;
        public int Mileage;
        public int NumDeliveries;
        public string Callsign;
        public DateTime create_date;
        public DateTime modified_date;
        public double MaxVelocity;
        public double MaxAcceleration;
        public double MaxVerticalVelocity;
        public double UpdateRate;
        public Schedule Schedule;
        public FlightState FlightState;

        public TransferObject Copy(TransferObject old)
        {
            TransferObject temp = new TransferObject
            {
                Id = old.Id,
                Mileage = old.Mileage,
                NumDeliveries = old.NumDeliveries,
                Callsign = old.Callsign,
                create_date = old.create_date,
                modified_date = old.modified_date,
                MaxVelocity = old.MaxVelocity,
                MaxAcceleration = old.MaxAcceleration,
                MaxVerticalVelocity = old.MaxVerticalVelocity,
                UpdateRate = old.UpdateRate,
                Schedule = new Schedule
                {
                    Id = old.Schedule.Id,
                    UAVId = old.Schedule.UAVId,
                    create_date = old.Schedule.create_date,
                    modified_date = old.Schedule.modified_date,
                    Missions = old.Schedule.Missions,
                },
                FlightState = old.FlightState,
            };
            return temp;
        }
    }

    public class SimApiController : ApiController
    {
        int numOfDrones = 5;    //num of drones per sim
        int numOfSims = 1;      //number of sims

        TransferObject[] xList;
        bool generated = false;
        int startIndex = 0;
        private NestContainer db = new NestContainer();
        

        public HttpResponseMessage GetInitSim()
        {
            int ct = 0;
            int i = 0;
            int j = 0;
            int k = 0;
            if (!generated)
            {
                generated = true;
                UAV temp = db.UAVs.Find(0);
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
                foreach (var vehicle in uavs)
                {
                    ct++;
                }
                xList = new TransferObject[ct];
                ct = 0;
                foreach(var vehicle in uavs){
                    xList[ct] = new TransferObject
                    {
                        Id = vehicle.Id,
                        Mileage = vehicle.Mileage,
                        NumDeliveries = vehicle.NumDeliveries,
                        Callsign = vehicle.Callsign,
                        create_date = vehicle.create_date,
                        modified_date = vehicle.modified_date,
                        MaxVelocity = vehicle.MaxVelocity,
                        MaxAcceleration = vehicle.MaxAcceleration,
                        MaxVerticalVelocity = vehicle.MaxVerticalVelocity,
                        UpdateRate = vehicle.UpdateRate,
                        Schedule = new Schedule
                        {
                            Id = vehicle.Schedule.Id,
                            UAVId = vehicle.Schedule.UAVId,
                            create_date = vehicle.Schedule.create_date,
                            modified_date = vehicle.Schedule.modified_date,
                            Missions = vehicle.Schedule.Missions,
                        },
                        FlightState = vehicle.FlightState,
                    };
                    ct++;
                }
                TransferObject[] transferList = new TransferObject[numOfDrones];
                for (int m = startIndex; m < (startIndex + numOfDrones) || m == transferList.Length-1; m++)
                {
                    transferList[m] = new TransferObject();
                    transferList[m] = transferList[m].Copy(xList[m]);
                }

                    return Request.CreateResponse(HttpStatusCode.OK, transferList);
            }
            else //xList is already generated
            {
                /*if current index is less than starting index + number of drones
                 * 
                 * 
                 */

                for (var q = startIndex; q < (startIndex + numOfDrones) || q == xList.Length + 1; q++)
                {

                }
                    //System.Diagnostics.Debug.WriteLine("Second sim opened, hit 'else'");
               
                return Request.CreateResponse(HttpStatusCode.OK, xList);
            }
        }
    }
}
