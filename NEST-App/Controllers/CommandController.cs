using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Spatial;
using System.Threading.Tasks;
using System.Web.Http.Description;
using Microsoft.AspNet.SignalR;
using NEST_App.DAL;
using NEST_App.Models;
using NEST_App.Models.DTOs;
using NEST_App.Hubs;
using System.Data.Entity.Validation;


namespace NEST_App.Controllers
{
    public class CommandController : ApiController
    {
        private NestContainer db = new NestContainer();

        // POST
        [HttpPost]
        [Route("api/command/goto/{uid}")]
        [ResponseType(typeof(CMD_NAV_Target))]
        public IHttpActionResult PostCMD_NAV_TARGET(int uid, CMD_NAV_Target jsObject)
        {
            CMD_NAV_Target cmd_nav_target = new CMD_NAV_Target();
            cmd_nav_target.Id = jsObject.Id;
            cmd_nav_target.Altitude = jsObject.Altitude;
            cmd_nav_target.Latitude = jsObject.Latitude;
            cmd_nav_target.Longitude = jsObject.Longitude;
            cmd_nav_target.UAVId = jsObject.UAVId;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.CMD_NAV_Target.Add(cmd_nav_target);
            db.SaveChanges();

            return Ok();
        }

        [HttpPost]
        [Route("api/command/hold/{uid}")]
        [ResponseType(typeof(CMD_NAV_Hold))]
        public IHttpActionResult PostCMD_NAV_HOLD(int uid, CMD_NAV_Hold jsObject)
        {
            CMD_NAV_Hold cmd_nav_hold = new CMD_NAV_Hold();
            cmd_nav_hold.Id = jsObject.Id;
            cmd_nav_hold.Altitude = jsObject.Altitude;
            cmd_nav_hold.Latitude = jsObject.Latitude;
            cmd_nav_hold.Longitude = jsObject.Longitude;
            cmd_nav_hold.UAVId = jsObject.UAVId;
            cmd_nav_hold.Time = jsObject.Time;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //db.CMD_NAV_Hold.Add(cmd_nav_hold);
            db.SaveChanges();
            System.Diagnostics.Debug.Write("Everything worked!!");
            return Ok();
        }
        
        // POST
        [HttpPost]
        [Route("api/command/land/{uid}")]
        [ResponseType(typeof(CMD_NAV_Land))]
        public IHttpActionResult PostCMD_NAV_LAND(int uid, CMD_NAV_Land jsObject)
        {
            CMD_NAV_Land cmd_nav_land = new CMD_NAV_Land();
            cmd_nav_land.Id = jsObject.Id;
            cmd_nav_land.Altitude = jsObject.Altitude;
            cmd_nav_land.Latitude = jsObject.Latitude;
            cmd_nav_land.Longitude = jsObject.Longitude;
            cmd_nav_land.Throttle = jsObject.Throttle;
            cmd_nav_land.UAVId = jsObject.UAVId;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.CMD_NAV_Land.Add(cmd_nav_land);
            db.SaveChanges();

            return Ok();
        }

        [HttpPost]
        [Route("api/command/return/{uid}")]
        [ResponseType(typeof(CMD_NAV_Return))]
        public IHttpActionResult PostCMD_NAV_RETURN(int uid, CMD_NAV_Return jsObject)
        {
            CMD_NAV_Return cmd_nav_return = new CMD_NAV_Return();
            cmd_nav_return.Id = jsObject.Id;
            cmd_nav_return.Latitude = jsObject.Latitude;
            cmd_nav_return.Longitude = jsObject.Longitude;
            cmd_nav_return.UAVId = jsObject.UAVId;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.CMD_NAV_Return.Add(cmd_nav_return);
            db.SaveChanges();

            return Ok();
        }

        [HttpPost]
        [Route("api/command/return/{uid}")]
        [ResponseType(typeof(CMD_NAV_Adjust))]
        public IHttpActionResult PostCMD_DO_RETURN(int uid, CMD_NAV_Adjust jsObject)
        {
            CMD_NAV_Adjust cmd_nav_adjust = new CMD_NAV_Adjust();
            cmd_nav_adjust.Id = jsObject.Id;
            cmd_nav_adjust.Latitude = jsObject.Latitude;
            cmd_nav_adjust.Longitude = jsObject.Longitude;
            cmd_nav_adjust.UAVId = jsObject.UAVId;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.CMD_NAV_Adjust.Add(cmd_nav_adjust);
            db.SaveChanges();

            return Ok();
        }


        // GET api/command
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/command/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/command
        public void Post([FromBody]string value)
        {
        }

        // PUT api/command/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/command/5
        public void Delete(int id)
        {
        }
    }
}
