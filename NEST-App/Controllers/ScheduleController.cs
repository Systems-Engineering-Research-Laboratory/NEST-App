using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Mvc;
using NEST_App.Models;
using NEST_App.DAL;

namespace NEST_App.Controllers
{
    public class ScheduleController : ApiController
    {
        private NestDbContext db = new NestDbContext();

        // GET api/Schedule
        public IQueryable<Schedule> GetSchedules()
        {
            return db.Schedules;
        }

        // GET api/Schedule/5
        [ResponseType(typeof(Schedule))]
        public IHttpActionResult GetSchedule(int id)
        {
            Schedule schedule = db.Schedules.Find(id);
            if (schedule == null)
            {
                return NotFound();
            }

            return Ok(schedule);
        }

        // PUT api/Schedule/5
        public IHttpActionResult PutSchedule(int id, Schedule schedule)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != schedule.Id)
            {
                return BadRequest();
            }

            db.Entry(schedule).State = System.Data.Entity.EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ScheduleExists(id))
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

        // POST api/Schedule
        [ResponseType(typeof(Schedule))]
        public IHttpActionResult PostSchedule(Schedule schedule)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.Schedules.Add(schedule);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = schedule.Id }, schedule);
        }

        // DELETE api/Schedule/5
        [ResponseType(typeof(Schedule))]
        public IHttpActionResult DeleteSchedule(int id)
        {
            Schedule schedule = db.Schedules.Find(id);
            if (schedule == null)
            {
                return NotFound();
            }

            db.Schedules.Remove(schedule);
            db.SaveChanges();

            return Ok(schedule);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool ScheduleExists(int id)
        {
            return db.Schedules.Count(e => e.Id == id) > 0;
        }
    }
}