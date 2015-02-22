using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using NEST_App.Models;
using System.Threading.Tasks;

namespace NEST_App.Controllers
{
    public class UsersController : ApiController
    {
        private NestContainer db = new NestContainer();

        // GET: api/Users
        public IQueryable<User> GetUsers()
        {
            return db.Users;
        }

        [HttpPost]
        [ResponseType(typeof(IEnumerable<UAV>))]
        [Route("api/users/assignmultiple/{user_id}/{amt}")]
        public IHttpActionResult assignMultipleUAVs(int user_id, int amt)
        {
            IEnumerable<UAV> uavs = db.UAVs.Where(u => u.User == null && u.isActive == true).Take(amt);
            NEST_App.Models.User user = db.Users.Find(user_id);
            foreach(UAV uav in uavs) {
                user.UAVs.Add(uav);
            }
            db.Entry(user).State = EntityState.Modified;
            try
            {
                db.SaveChanges();
            }
            catch
            {
                return StatusCode(HttpStatusCode.Conflict);
            }

            return Ok(user);
        }

        // GET: api/Users/5
        [ResponseType(typeof(User))]
        public IHttpActionResult GetUser(int id)
        {
            User user = db.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        [ResponseType(typeof(IEnumerable<UAV>))]
        [HttpGet]
        [Route("api/users/getassigneduavs/{id}")]
        public async Task<IHttpActionResult> getAssignedUavs(int id)
        {
            User user = await db.Users.FindAsync(id);
            IEnumerable<UAV> uavs = user.UAVs;


            return Ok(uavs);
        }

        // PUT: api/Users/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutUser(int id, User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != user.user_id)
            {
                return BadRequest();
            }

            db.Entry(user).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
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

        // POST: api/Users
        [ResponseType(typeof(User))]
        public IHttpActionResult PostUser(User user)
        {
            user.create_date = DateTime.Now;
            user.modified_date = DateTime.Now;
            user.UserRole = new UserRole
            {
                access_level = "admin",
                role_type = "admin"
            };
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Users.Add(user);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = user.user_id }, user);
        }

        // DELETE: api/Users/5
        [ResponseType(typeof(User))]
        public IHttpActionResult DeleteUser(int id)
        {
            User user = db.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }

            db.Users.Remove(user);
            db.SaveChanges();

            return Ok(user);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool UserExists(int id)
        {
            return db.Users.Count(e => e.user_id == id) > 0;
        }
    }
}