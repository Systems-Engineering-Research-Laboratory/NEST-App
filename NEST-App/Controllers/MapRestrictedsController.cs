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
using NEST_App.Models;

namespace NEST_App.Controllers
{
    public class MapRestrictedsController : ApiController
    {
        private NestContainer db = new NestContainer();

        // GET: api/MapRestricteds
        public IQueryable<MapRestricted> GetMapRestrictedSet()
        {
            return db.MapRestrictedSet;
        }

        // GET: api/MapRestricteds/5
        [ResponseType(typeof(MapRestricted))]
        public IHttpActionResult GetMapRestricted(int id)
        {
            MapRestricted mapRestricted = db.MapRestrictedSet.Find(id);
            if (mapRestricted == null)
            {
                return NotFound();
            }

            return Ok(mapRestricted);
        }

        // PUT: api/MapRestricteds/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutMapRestricted(int id, MapRestricted mapRestricted)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != mapRestricted.Id)
            {
                return BadRequest();
            }

            db.Entry(mapRestricted).State = System.Data.Entity.EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MapRestrictedExists(id))
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

        // POST: api/MapRestricteds
        [ResponseType(typeof(MapRestricted))]
        public IHttpActionResult PostMapRestricted(MapRestricted mapRestricted)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.MapRestrictedSet.Add(mapRestricted);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = mapRestricted.Id }, mapRestricted);
        }

        // DELETE: api/MapRestricteds/5
        [ResponseType(typeof(MapRestricted))]
        public IHttpActionResult DeleteMapRestricted(int id)
        {
            MapRestricted mapRestricted = db.MapRestrictedSet.Find(id);
            if (mapRestricted == null)
            {
                return NotFound();
            }

            db.MapRestrictedSet.Remove(mapRestricted);
            db.SaveChanges();

            return Ok(mapRestricted);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool MapRestrictedExists(int id)
        {
            return db.MapRestrictedSet.Count(e => e.Id == id) > 0;
        }
    }
}