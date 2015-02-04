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
using NEST_App.Models;

namespace NEST_App.Controllers
{
    public class MapRestrictedController : ApiController
    {
        private NestContainer db = new NestContainer();

        // GET: api/MapRestricted
        public IQueryable<MapRestricted> GetMapRestrictedSet()
        {
            return db.MapRestrictedSet;
        }

        // GET: api/MapRestricted/5
        [ResponseType(typeof(MapRestricted))]
        public async Task<IHttpActionResult> GetMapRestricted(int id)
        {
            MapRestricted mapRestricted = await db.MapRestrictedSet.FindAsync(id);
            if (mapRestricted == null)
            {
                return NotFound();
            }

            return Ok(mapRestricted);
        }

        // PUT: api/MapRestricted/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutMapRestricted(int id, MapRestricted mapRestricted)
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
                await db.SaveChangesAsync();
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

        // POST: api/MapRestricted
        [ResponseType(typeof(MapRestricted))]
        public async Task<IHttpActionResult> PostMapRestricted(MapRestricted mapRestricted)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            db.MapRestrictedSet.Add(mapRestricted);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = mapRestricted.Id }, mapRestricted);
        }

        // DELETE: api/MapRestricted/5
        [ResponseType(typeof(MapRestricted))]
        public async Task<IHttpActionResult> DeleteMapRestricted(int id)
        {
            MapRestricted mapRestricted = await db.MapRestrictedSet.FindAsync(id);
            if (mapRestricted == null)
            {
                return NotFound();
            }

            db.MapRestrictedSet.Remove(mapRestricted);
            await db.SaveChangesAsync();

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