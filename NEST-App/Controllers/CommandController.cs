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

        [HttpPost]
        [Route("api/command/nav/return/{uavId}/{opId}")]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> ReturnToBase(int uavId, int opId, Object cmd)
        {

            if (await db.SaveChangesAsync() > 0)
            {
                return Ok();
            }
            else
            {
                Console.Write("Not ok");
                return NotFound();
            }
        }

        [HttpPost]
        [Route("api/command/nav/return/{uavId}/{opId}")]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> HoldPosition(int uavId, int opId, Object cmd)
        {

            if (await db.SaveChangesAsync() > 0)
            {
                return Ok();
            }
            else
            {
                Console.Write("Not ok");
                return NotFound();
            }
        }
        
        [HttpPost]
        [Route("api/command/nav/return/{uavId}/{opId}")]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> ForceLand(int uavId, int opId, Object cmd)
        {

            if (await db.SaveChangesAsync() > 0)
            {
                return Ok();
            }
            else
            {
                Console.Write("Not ok");
                return NotFound();
            }
        }
        
        [HttpPost]
        [Route("api/command/nav/return/{uavId}/{opId}")]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> InsertWaypoint(int uavId, int opId, Object cmd)
        {

            if (await db.SaveChangesAsync() > 0)
            {
                return Ok();
            }
            else
            {
                Console.Write("Not ok");
                return NotFound();
            }
        }

        [HttpPost]
        [Route("api/command/nav/return/{uavId}/{opId}")]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> GoTo(int uavId, int opId, Object cmd)
        {

            if (await db.SaveChangesAsync() > 0)
            {
                return Ok();
            }
            else
            {
                Console.Write("Not ok");
                return NotFound();
            }
        }

        [HttpPost]
        [Route("api/command/nonav/return/{uavId}/{opId}")]
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> AdjustParameters(int uavId, int opId, Object cmd)
        {

            if (await db.SaveChangesAsync() > 0)
            {
                return Ok();
            }
            else
            {
                Console.Write("Not ok");
                return NotFound();
            }
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
