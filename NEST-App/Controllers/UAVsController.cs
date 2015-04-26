using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Spatial;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web;
using NEST_App.DAL;
using NEST_App.Models;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Data.Entity.Validation;
using Microsoft.AspNet.SignalR;
using NEST_App.Hubs;

namespace NEST_App.Controllers.Api
{
    public static class GeoCodeCalc
    {
        public const double EarthRadiusInMiles = 3956.0;
        public const double EarthRadiusInKilometers = 6367.0;

        public static double ToRadian(double val) { return val * (Math.PI / 180); }
        public static double DiffRadian(double val1, double val2) { return ToRadian(val2) - ToRadian(val1); }

        public static double CalcDistance(double lat1, double lng1, double lat2, double lng2)
        {
            return CalcDistance(lat1, lng1, lat2, lng2, GeoCodeCalcMeasurement.Miles);
        }

        public static double CalcDistance(double lat1, double lng1, double lat2, double lng2, GeoCodeCalcMeasurement m)
        {
            double radius = GeoCodeCalc.EarthRadiusInMiles;

            if (m == GeoCodeCalcMeasurement.Kilometers) { radius = GeoCodeCalc.EarthRadiusInKilometers; }
            return radius * 2 * Math.Asin(Math.Min(1, Math.Sqrt((Math.Pow(Math.Sin((DiffRadian(lat1, lat2)) / 2.0), 2.0) + Math.Cos(ToRadian(lat1)) * Math.Cos(ToRadian(lat2)) * Math.Pow(Math.Sin((DiffRadian(lng1, lng2)) / 2.0), 2.0)))));
        }
    }

    public enum GeoCodeCalcMeasurement : int
    {
        Miles = 0,
        Kilometers = 1
    }
    public class UAVsController : ApiController
    {
        private readonly NestContainer _db = new NestContainer();
        private readonly string[] _lines = File.ReadAllLines(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Content\\Names.txt"));
        private readonly string[] _lines2 = File.ReadAllLines(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Content\\Flowers.txt"));
        private readonly Random _rand = new Random();

        [HttpGet]
        [Route("api/uavs/geteta/{id}")]
        public DateTime GetEta(int id)
        {
            

            return new DateTime();
        }

        [HttpGet]
        [Route("api/uavs/getsta/{id}")]
        public DateTime GetSta(int id)
        {
            var uav = _db.UAVs.Find(id);
            var firstOrDefault = uav.Schedules.FirstOrDefault();
            if (firstOrDefault == null) return new DateTime();
            if (firstOrDefault.CurrentMission == null) return new DateTime();
            var currentMissionId = (int) firstOrDefault.CurrentMission;
            var currentMission = _db.Missions.Find(currentMissionId);

            if (currentMission.TimeAssigned == null) return new DateTime();
            var flightState = uav.FlightStates.FirstOrDefault();
            if (flightState == null) return new DateTime();
            currentMission.ScheduledCompletionTime = ((DateTime) currentMission.TimeAssigned).AddMinutes(GeoCodeCalc.CalcDistance(flightState.Latitude,
                flightState.Longitude, currentMission.Latitude, currentMission.Longitude) / uav.MaxVelocity);
            _db.Entry(currentMission).State = System.Data.Entity.EntityState.Modified;
            _db.SaveChanges();
            return (DateTime)currentMission.ScheduledCompletionTime;
        }

        [HttpGet]
        [Route("api/uavs/getavailabledistance/{id}")]
        public double GetAvailableDistance(int id)
        {
            var uav = _db.UAVs.Find(id);
            var firstOrDefault = uav.FlightStates.FirstOrDefault();
            if (firstOrDefault != null)
                return uav.Mileage/ ( 1.0 * firstOrDefault.BatteryLevel ) ;
            return 0;
        }

        [HttpGet]
        [Route("api/uavs/searchbycallsign")]
        public async Task<UAV> SearchByCallsign(string callsign)
        {
            var uavs = from u in _db.UAVs
                       where u.Callsign.Equals(callsign)
                       select u;
            if (!uavs.Any())
            {
                return null;
            }
            return await uavs.FirstAsync();
        }

        [HttpGet]
        [Route("api/uavs/getworkload/{id}")]
        public int GetWorkload(int id)
        {
            var uav = _db.UAVs.Find(id);
            return uav.estimated_workload;
        }

        [HttpGet]
        [Route("api/uavs/calculateworkloadforuav/{id}")]
        public int CalculateWorkloadForUav(int id)
        {
            var uav = _db.UAVs.Find(id);
            int workload = 0;
            workload += uav.Schedules.Count;
            foreach (var sched in uav.Schedules)
            {
                workload += sched.Missions.Count;
                workload += sched.Missions.Sum(miss => miss.Waypoints.Count);
            }
            return workload;
        }

        [HttpPost]
        [Route("api/uavs/rejectassignment")]
        public HttpResponseMessage RejectAssignment(int uavid, int userid)
        {
            var user = _db.Users.Find(userid);
            var uav = _db.UAVs.Find(uavid);
            var nextUserInQueue = _db.Users.FirstOrDefault(u => u.position_in_queue == 1);
            try
            {
                user.UAVs.Remove(uav);
                if (nextUserInQueue != null)
                {
                    nextUserInQueue.UAVs.Add(uav);
                    uav.User = nextUserInQueue;
                    foreach (var usr in _db.Users.Where(u => u.user_id != nextUserInQueue.user_id))
                    {
                        usr.position_in_queue--;
                        _db.Entry(usr).State = System.Data.Entity.EntityState.Modified;
                    }
                    nextUserInQueue.position_in_queue = _db.Users.Count();
                    _db.Entry(nextUserInQueue).State = System.Data.Entity.EntityState.Modified;
                    _db.Entry(uav).State = System.Data.Entity.EntityState.Modified;
                    _db.SaveChanges();
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.Conflict);
                }

                _db.Entry(uav).State = System.Data.Entity.EntityState.Modified;
                _db.Entry(user).State = System.Data.Entity.EntityState.Modified;

                var hub = GlobalHost.ConnectionManager.GetHubContext<VehicleHub>();
                hub.Clients.All.UavRejected(uavid);

            }
            catch (Exception e)
            {
                return Request.CreateResponse(HttpStatusCode.Conflict);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Route("api/uavs/assignment/{id}/{userId}")]
        public async Task<HttpResponseMessage> UAVAssignment(int id, int? userId)
        {
            try
            {
                UAV u = _db.UAVs.FirstOrDefault(x => x.Id == id);
                u.User_user_id = userId;
                _db.Entry(u).State = System.Data.Entity.EntityState.Modified;
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            return Request.CreateResponse(HttpStatusCode.OK);
        }
        [HttpPost]
        [Route("api/uavs/adduavandassign")]
        public HttpResponseMessage AddUavAndAssign(UAV uav)
        {
            try
            {
                uav.estimated_workload = 0;
                _db.UAVs.Add(uav);
                var nextUserInQueue = _db.Users.FirstOrDefault(u => u.position_in_queue == 1);
                var users = _db.Users;
                if (nextUserInQueue != null)
                {
                    nextUserInQueue.UAVs.Add(uav);
                    uav.User = nextUserInQueue;
                    foreach (var user in users.Where(user => user.user_id != nextUserInQueue.user_id && user.UserRole.role_type == "Flight Dispatcher"))
                    {
                        user.position_in_queue--;
                        _db.Entry(user).State = System.Data.Entity.EntityState.Modified;
                    }
                    nextUserInQueue.position_in_queue = users.Count();
                    _db.Entry(nextUserInQueue).State = System.Data.Entity.EntityState.Modified;
                    _db.Entry(uav).State = System.Data.Entity.EntityState.Modified;
                    _db.SaveChanges();
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.Conflict);
                }
            }
            catch (Exception exception)
            {
                return Request.CreateResponse(HttpStatusCode.Conflict);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
            //emit to user that uav has been tasked to them later via signalr
        }

        [HttpPost]
        [Route("api/uavs/assignexistinguav/{uavid}")]
        public HttpResponseMessage AssignExistingUav(int uavid)
        {
            try
            {
                var foundUav = _db.UAVs.Find(uavid);
                var nextUserInQueue = _db.Users.FirstOrDefault(u => u.position_in_queue == 1);
                var users = _db.Users;
                if (nextUserInQueue != null)
                {
                    nextUserInQueue.UAVs.Add(foundUav);
                    foundUav.User = nextUserInQueue;
                    foreach (var user in users.Where(user => user.user_id != nextUserInQueue.user_id && user.UserRole.role_type == "Flight Dispatcher"))
                    {
                        user.position_in_queue--;
                        _db.Entry(user).State = System.Data.Entity.EntityState.Modified;
                    }
                    nextUserInQueue.position_in_queue = users.Count();
                    _db.Entry(nextUserInQueue).State = System.Data.Entity.EntityState.Modified;
                    _db.Entry(foundUav).State = System.Data.Entity.EntityState.Modified;
                    _db.SaveChanges();
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.Conflict);
                }
            }
            catch (Exception exception)
            {
                return Request.CreateResponse(HttpStatusCode.Conflict);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        private DbGeography getDistance()
        {
            int alt = 400;                                  //altitude of UAV with 400 ft default
            double homeLat = 34.2420;                       //default home latitude
            double homeLon = -118.5288;                      //default home longitude
            double radius = 8050;                           //meters (5 miles)
            double radiusDegrees = radius / 111300f;        //convert meters to degrees, from the equator, 111300 meters in 1 degree
            double lat2 = _rand.NextDouble();                //random double latitude
            double lon2 = _rand.NextDouble();                //random double longitude
            double w = radiusDegrees * Math.Sqrt(lat2);
            double t = 2 * Math.PI * lon2;
            double x = w * Math.Cos(t);
            double y = w * Math.Sin(t);

            double newX = x / Math.Cos(homeLat);

            double newLon = newX + homeLon;
            double newLat = y + homeLat;

            string point = "POINT(" + newLon.ToString() + " " + newLat.ToString() + " " + alt.ToString() + ")";
            return DbGeography.FromText(point);
        }

        private string getName()
        {
            //string userPath = AppDomain.CurrentDomain.BaseDirectory;
            //string filePath = Path.Combine(userPath, "Content\\Names.txt");
            //var lines = File.ReadAllLines(filePath);
            var rand = new Random();
            var randomLineNumber = rand.Next(0, _lines.Length - 1);
            var line = _lines[randomLineNumber];
            return line;
        }

        private string getPackage()
        {
            //string userPath = AppDomain.CurrentDomain.BaseDirectory;
            //string filePath = Path.Combine(userPath, "Content\\Flowers.txt");
            //var lines = File.ReadAllLines(filePath);
            var rand = new Random();
            var randomLineNumber = rand.Next(0, _lines2.Length - 1);
            var line = _lines2[randomLineNumber];
            return line;
        }

        //GET: api/uavs/getuavinfo
        [HttpGet]
        [Route("api/uavs/getuavinfo")]
        public async Task<HttpResponseMessage> GetUAVInfo()
        {
            var uavs = from u in _db.UAVs.Include(u => u.FlightStates).Include(u => u.Schedules).Include(u => u.EventLogs)
                       let s = u.Schedules.OrderBy(s => s.create_date).FirstOrDefault()
                       let m = s.Missions.OrderBy(m => m.create_date).FirstOrDefault()
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
                           Mission = m,
                           FlightState = u.FlightStates.OrderBy(fs => fs.Timestamp).FirstOrDefault(),
                           EventLog = u.EventLogs,
                       };
            return Request.CreateResponse(HttpStatusCode.OK, uavs);
        }

        [HttpPost]
        [ResponseType(typeof(HttpResponseMessage))]
        [Route("api/uavs/createuavmission/{number}")]
        public async Task<HttpResponseMessage> createMission(int number)
        {
            Random num = new Random();
            var missions = new List<Mission>();
            for (int i = 0; i < number; i++)
            {
                DbGeography p = getDistance();
                var miss = new Mission
                {
                    Phase = "standby",
                    FlightPattern = "abstract",
                    Payload = getPackage(),
                    Priority = 1,
                    FinancialCost = num.Next(1, 99),
                    TimeAssigned = null,
                    TimeCompleted = null,
                    //DestinationCoordinates = DbGeography.FromText("POINT(-118.52529 34.241670 400)"),  
                    Latitude = p.Latitude ?? 34.2420,
                    Longitude = p.Longitude ?? -118.5288,
                    ScheduledCompletionTime = null,
                    EstimatedCompletionTime = null,
                    create_date = DateTime.Now,
                    modified_date = null
                };
                missions.Add(miss);
            }
            _db.Missions.AddRange(missions);
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException e)
            {
                System.Diagnostics.Debug.Write(e);
            }
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        /// <summary>
        /// Creates missions and assigns them to the schedules
        /// </summary>
        /// <returns></returns>
        [HttpPut]
        [ResponseType(typeof(HttpResponseMessage))]
        [Route("api/uavs/schedulemissions")]
        public async Task<HttpResponseMessage> scheduleMission()
        {
            //Ensure that the UAVs have schedules before we do the round robin so we don't skip UAVs
            await createSchedulesForUavs();
            IEnumerable<Schedule> schedQOrdered = _db.Schedules.OrderByDescending(s => s.UAV.estimated_workload).AsEnumerable() ;
            if (schedQOrdered != null)
            {
                Queue<Schedule> schedQ = new Queue<Schedule>(schedQOrdered);
                //Grab all the unassigned missions in the database.
                var unassigned = from mis in _db.Missions
                                 where mis.ScheduleId == null
                                 select mis;

                //Uav Id and the mission assigned. Put into list in case the db update fails.
                List<Tuple<int?, Mission>> uavMissionPairs = new List<Tuple<int?, Mission>>();

                //Assign each of those unassigned missions to the a schedule
                foreach (Mission mis in unassigned)
                {
                    Schedule s = schedQ.Dequeue();
                    s.UAV.estimated_workload++;
                    s.Missions.Add(mis);
                    if (s.CurrentMission == null)
                    {
                        //This schedule had no current mission, so just assign it one
                        s.CurrentMission = mis.id;
                    }
                    uavMissionPairs.Add(new Tuple<int?, Mission>(s.UAVId, mis));
                    //Add to the back of the queue for round robinness
                    schedQ.Enqueue(s);
                }

                try
                {
                    await _db.SaveChangesAsync();
                    //Now use signalr to assign the missions to the vehicles.
                    var hub = GlobalHost.ConnectionManager.GetHubContext<VehicleHub>();
                    foreach (var tup in uavMissionPairs)
                    {
                        int? uavId = tup.Item1;
                        Mission mis = tup.Item2;
                        hub.Clients.All.newMissionAssignment(uavId, new
                        {
                            id = mis.id,
                            Latitude = mis.Latitude,
                            Longitude = mis.Longitude,
                            EstimatedCompletionTime = mis.EstimatedCompletionTime,
                            TimeAssigned = mis.TimeAssigned,
                            TimeCompleted = mis.TimeCompleted,
                            ScheduledCompletionTime = mis.ScheduledCompletionTime,
                            ScheduleId = mis.ScheduleId,
                            create_date = mis.create_date,
                            modified_date = mis.modified_date,
                            Phase = mis.Phase,
                            FlightPattern = mis.FlightPattern,
                            Payload = mis.Payload,
                            FinancialCost = mis.FinancialCost,

                        });
                    }
                }
                catch (DbUpdateConcurrencyException)
                {
                    throw;
                }
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        DateTime RandomDay()
        {
            DateTime init = DateTime.Today.AddMonths(-1);
            Random gen = new Random();

            int range = (DateTime.Today - init).Days;
            return init.AddDays(gen.Next(range));
        }

        [HttpPut]
        [ResponseType(typeof(HttpResponseMessage))]
        [Route("api/uavs/createmaintenance/{num}")]
        public async Task<HttpResponseMessage> createMaintenance(int num)
        {
            var maintenance = new List<Maintenance>();
            Queue<Schedule> maintQ = new Queue<Schedule>(_db.Schedules);

            for (int i = 0; i < num; i++)
            {
                var maint = new Maintenance
                {
                    ScheduleId = i,
                    last_maintenance = RandomDay(),
                    next_maintenance = DateTime.Today,
                    time_remaining = DateTime.Today.ToString(),
                    create_date = DateTime.Today,
                    modified_date = DateTime.Today,
                };

                var sched = maintQ.Dequeue();
                sched.Maintenances.Add(maint);
                _db.Entry(sched).State = System.Data.Entity.EntityState.Modified;
                maintQ.Enqueue(sched);
            }
            _db.Maintenances.AddRange(maintenance);

            await _db.SaveChangesAsync();

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        /// <summary>
        /// This creates schedules for UAVs that do not have a schedules
        /// </summary>
        /// <returns>true always</returns>
        private async Task<bool> createSchedulesForUavs()
        {
            var uavsWithNoScheds = from u in _db.UAVs
                                   where u.Schedules.Count == 0
                                   select u;
            foreach (UAV u in uavsWithNoScheds)
            {
                u.Schedules = new List<Schedule>
                {
                    new Schedule
                    {
                        UAVId = u.Id,
                        create_date = DateTime.Now,
                        modified_date = DateTime.Now,
                    }
                };
                _db.Entry(u).State = System.Data.Entity.EntityState.Modified;
            }

            await _db.SaveChangesAsync();

            return true;
        }

        [HttpGet]
        [Route("api/uavs/generateuavs/{number}")]
        public async Task<IHttpActionResult> generateUAVs(int number)
        {
            Random num = new Random();
            for (int i = 0; i < number; i++)
            {
                UAV uav = new UAV
                {
                    Callsign = getName().ToUpper() + num.Next(1, 99),
                    NumDeliveries = num.Next(1, 2000),
                    Mileage = num.Next(1, 100),
                    Id = i,
                    create_date = DateTime.Now,
                    modified_date = DateTime.Now,
                    MaxAcceleration = 20,
                    MaxVelocity = 20,
                    MaxVerticalVelocity = 20,
                    MinDeliveryAlt = 100,
                    UpdateRate = 1000,
                    CruiseAltitude = 400,
                    isActive = true,
                };

                uav.Schedules.Add(new Schedule
                {
                    UAVId = uav.Id,
                    create_date = DateTime.Now,
                    modified_date = DateTime.Now,
                    CurrentMission = null
                });

                Configuration config = new Configuration
                {
                    Classification = "Predator",
                    create_date = DateTime.Now,
                    modified_date = DateTime.Now,
                    Name = "Default",
                    NumberOfMotors = 4
                };
                var flights = new List<FlightState>
                {
                   new FlightState { 
                       Longitude = -118.5288,
                       Latitude = 34.2420,
                       Altitude = 400,
                       VelocityX = 0, 
                       VelocityY = 0, 
                       VelocityZ = 0, 
                       Yaw = 0, 
                       Roll = 0, 
                       Pitch = 0, 
                       YawRate = 0, 
                       RollRate = 0, 
                       PitchRate = 0, 
                       BatteryLevel = .99, 
                       UAVId = i
                   },    
               };
                flights.ForEach(f =>
                {
                    f.Timestamp = DateTime.Now;
                    f.create_date = DateTime.Now;
                    f.modified_date = DateTime.Now;
                });

                DateTime dateValue = new DateTime();
                dateValue = DateTime.Now;
                var randPoint = getDistance();

                uav.Configurations = config;
                uav.FlightStates = flights;
                //uav.Schedules = sched;

                _db.UAVs.Add(uav);
                //db.Missions.Add(mission.First());
                //db.Maintenances.Add(maintenances.First());
                _db.Configurations.Add(config);
                //db.Schedules.Add(sched.First());
                _db.FlightStates.Add(flights.First());

                try
                {
                    _db.SaveChanges();
                }
                catch (DbUpdateException e)
                {
                    Console.Write(e.Entries);
                }
            }
            var drones = from u in _db.UAVs.Include(u => u.FlightStates)
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
                             FlightState = u.FlightStates.OrderBy(fs => fs.Timestamp).FirstOrDefault(),
                             EventLog = u.EventLogs
                         };
            return Ok(drones);
        }

        [HttpPost]
        [ResponseType(typeof(HttpResponseMessage))]
        [Route("api/uavs/postuavevent")]
        public async Task<HttpResponseMessage> PostUavEvent(EventLog evnt)
        {
            evnt.create_date = DateTime.Now;
            evnt.modified_date = DateTime.Now;
            _db.EventLogs.Add(evnt);

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
            return Request.CreateResponse(HttpStatusCode.OK);
        }


        // GET: api/UAVs
        public IQueryable<UAV> GetUAVs()
        {
            return _db.UAVs.Where(u => u.isActive == true);
            //return db.UAVs;
        }

        // GET: api/UAVs/5
        [ResponseType(typeof(UAV))]
        public async Task<IHttpActionResult> GetUAV(int id)
        {
            UAV uAV = await _db.UAVs.FindAsync(id);
            if (uAV == null)
            {
                return NotFound();
            }

            return Ok(uAV);
        }

        // PUT: api/UAVs/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutUAV(int id, UAV uAV)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != uAV.Id)
            {
                return BadRequest();
            }

            _db.Entry(uAV).State = System.Data.Entity.EntityState.Modified;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UAVExists(id))
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

        [ResponseType(typeof(UAV))]
        [Route("api/uavs/addUavWithAutoConfig")]
        [HttpPost]
        public async Task<IHttpActionResult> PostUAVWithConfig(UAV uav)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            uav.Configurations = new Configuration
                {
                    Classification = "quadrotor",
                    create_date = DateTime.Now,
                    modified_date = DateTime.Now,
                    Name = "autogen",
                    NumberOfMotors = 4,

                };

            uav.Schedules.Add(new Schedule
            {
                UAVId = uav.Id,
                create_date = DateTime.Now,
                modified_date = DateTime.Now,
                CurrentMission = null
            });
            _db.UAVs.Add(uav);
            await _db.SaveChangesAsync();

            return Ok(uav);
        }

        // POST: api/UAVs
        [ResponseType(typeof(UAV))]
        public async Task<IHttpActionResult> PostUAV(UAV uAV)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _db.UAVs.Add(uAV);
            await _db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = uAV.Id }, uAV);
        }

        // DELETE: api/UAVs/5
        [ResponseType(typeof(UAV))]
        public async Task<IHttpActionResult> DeleteUAV(int id)
        {
            UAV uAV = await _db.UAVs.FindAsync(id);
            if (uAV == null)
            {
                return NotFound();
            }

            _db.UAVs.Remove(uAV);
            await _db.SaveChangesAsync();

            return Ok(uAV);
        }
        [ResponseType(typeof(IEnumerable<UAV>))]
        [HttpGet]
        [Route("api/uavs/getunassigned")]
        public IHttpActionResult getUnassigned()
        {
            IEnumerable<UAV> uavs = _db.UAVs.Where(u => u.User == null && u.isActive);
            return Ok(uavs);
        }

        [ResponseType(typeof(UAV))]
        [HttpPost]
        [Route("api/uavs/assignuser/{uav_id}/{user_id}")]
        public async Task<IHttpActionResult> assignUser(int uav_id, int user_id)
        {
            UAV uav = await _db.UAVs.FindAsync(uav_id);
            User user = await _db.Users.FindAsync(user_id);
            if (uav == null || user == null)
            {
                return NotFound();
            }
            uav.User = user;
            user.UAVs.Add(uav);
            _db.Entry(uav).State = System.Data.Entity.EntityState.Modified;
            _db.Entry(user).State = System.Data.Entity.EntityState.Modified;
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw;
            }
            return Ok(uav);
        }

        [ResponseType(typeof(UAV))]
        [HttpPut]
        [Route("api/uavs/disableuav/{id}")]
        public async Task<IHttpActionResult> disableUAV(int id)
        {
            UAV uav = await _db.UAVs.FindAsync(id);
            if (uav == null)
            {
                return NotFound();
            }
            uav.isActive = false;


            _db.Entry(uav).State = System.Data.Entity.EntityState.Modified;

            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UAVExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return Ok(uav);

        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UAVExists(int id)
        {
            return _db.UAVs.Count(e => e.Id == id) > 0;
        }
    }
}