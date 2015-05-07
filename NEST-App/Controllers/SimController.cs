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


using System.Web.Http;
using System.Web.Http.Description;
using System.Web;

using System.Data.Entity.Spatial;
using System.Data.Entity.Infrastructure;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Data.Entity.Validation;
using Microsoft.AspNet.SignalR;
using NEST_App.Hubs;




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

        //Copy the contents of the master UAV list at given index to a new UAV list index
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
        int numOfDrones = 500;    //num of drones per sim

        static TransferObject[] xList;
        static bool generated = false;
        static int startIndex = 0;

        private NestContainer db = new NestContainer();



        //[HttpGet]
        //[Route("api/sim/resetsim")]
        //public void ResetSim()
        //{
        //    startIndex = 0;
        //}

        public HttpResponseMessage GetInitSim()
        {
            int ct = 0;
            //Check if the UAV list has already been created
            if (!generated)
            {
                //Flag the list as being created
                //System.Diagnostics.Debug.WriteLine("started");
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
                               User = u.User
                           };
                //System.Diagnostics.Debug.WriteLine("uav var generated");
                //Find out how many drones have been retrieved
                foreach (var vehicle in uavs)
                {
                    ct++;
                }
                //Create a transferobject list of uavs
                xList = new TransferObject[ct];
                ct = 0;

                //Populate the uav list
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
                //System.Diagnostics.Debug.WriteLine("List created");
                int capacity = 0;
                //Check if creating a new numofdrones-sized array would exceed the number of remaining, unassigned drones
                //If it would exceed, make the length only as long as the remaining number of drones
                if ((startIndex + numOfDrones) > xList.Length)
                {
                    capacity = xList.Length - startIndex;
                }
                else
                {
                    capacity = numOfDrones;
                }
                TransferObject[] transferList = new TransferObject[capacity];
                for (int i = startIndex; i < (startIndex + numOfDrones) && i < xList.Length; i++)
                {
                    transferList[i] = new TransferObject();
                    transferList[i] = transferList[i].Copy(xList[i]);
                }
                //Build the list of drones to send to the simulator
                startIndex += numOfDrones;

                return Request.CreateResponse(HttpStatusCode.OK, transferList);
            }
            else //xList is already generated
            {
                if (startIndex > xList.Length) {
                    return Request.CreateResponse(HttpStatusCode.BadRequest);
                }
                else
                {
                    int capacity = 0;
                    //Check if creating a new numofdrones-sized array would exceed the number of remaining, unassigned drones
                    //If it would exceed, make the length only as long as the remaining number of drones
                    if ((startIndex + numOfDrones) > xList.Length)
                    {
                        capacity = xList.Length - startIndex;
                    }
                    else
                    {
                        capacity = numOfDrones;
                    }
                    TransferObject[] transferList = new TransferObject[capacity];

                    //Build the list of drones to send to the simulator
                    for (int i = 0; i < numOfDrones && (i + startIndex) < xList.Length; i++)
                    {
                        transferList[i] = new TransferObject();
                        transferList[i] = transferList[i].Copy(xList[i + startIndex]);
                    }
                    //Increase the starting index of the next iteration
                    startIndex += numOfDrones;

                    return Request.CreateResponse(HttpStatusCode.OK, transferList);
                }
            }
        }

        [System.Web.Http.HttpGet]
        [System.Web.Http.Route("api/simapi/freshsim")]
        public HttpResponseMessage freshSim()
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
