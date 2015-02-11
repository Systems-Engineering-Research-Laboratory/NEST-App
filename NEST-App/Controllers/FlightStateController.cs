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
using NEST_App.DAL;
using NEST_App.Models;
using AutoMapper;
using AutoMapper.QueryableExtensions;

namespace NEST_App.Controllers
{
    public class FlightStateController : ApiController
    {
        private NestDbContext db = new NestDbContext();

        // GET: api/FlightState
        public IQueryable<FlightStateDTO> GetFlightStates()
        {
            var flightStates = from fs in db.FlightStates
                               select new FlightStateDTO
                               {
                                   Id = fs.Id,
                                   Latitude = fs.Latitude,
                                   Longitude = fs.Longitude,
                                   Altitude = fs.Altitude,
                                   VelocityX = fs.VelocityX,
                                   VelocityY = fs.VelocityY,
                                   VelocityZ = fs.VelocityZ,
                                   Yaw = fs.Yaw,
                                   YawRate = fs.YawRate,
                                   Timestamp = fs.Timestamp,
                                   Roll = fs.Roll,
                                   RollRate = fs.RollRate,
                                   Pitch = fs.Pitch,
                                   PitchRate = fs.PitchRate,
                                   UAVId = fs.UAVId
                               };
            return flightStates;
        }

        // GET: api/FlightState/5
        [ResponseType(typeof(FlightStateDTO))]
        public async Task<IHttpActionResult> GetFlightState(int id)
        {
            FlightState flightState = await db.FlightStates.FindAsync(id);
            if (flightState == null)
            {
                return NotFound();
            }

            FlightStateDTO dto = new FlightStateDTO();
            dto.buildDTO(flightState);

            return Ok(dto);
        }

        // PUT: api/FlightState/5
        [ResponseType(typeof(void))]
        public async Task<IHttpActionResult> PutFlightState(int id, FlightStateDTO flightStateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != flightStateDto.Id)
            {
                return BadRequest();
            }
            FlightState flightState = Mapper.Map<FlightState>(flightStateDto);
            db.Entry(flightState).State = System.Data.Entity.EntityState.Modified;

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FlightStateExists(id))
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

        // POST: api/FlightState
        [ResponseType(typeof(FlightState))]
        public async Task<IHttpActionResult> PostFlightState(FlightStateDTO flightStateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            FlightState flightState = Mapper.Map<FlightState>(flightStateDto);

            db.FlightStates.Add(flightState);
            await db.SaveChangesAsync();

            return CreatedAtRoute("DefaultApi", new { id = flightState.Id }, flightState);
        }

        // DELETE: api/FlightState/5
        [ResponseType(typeof(FlightState))]
        public async Task<IHttpActionResult> DeleteFlightState(int id)
        {
            FlightState flightState = await db.FlightStates.FindAsync(id);
            if (flightState == null)
            {
                return NotFound();
            }

            db.FlightStates.Remove(flightState);
            await db.SaveChangesAsync();

            return Ok(flightState);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool FlightStateExists(int id)
        {
            return db.FlightStates.Count(e => e.Id == id) > 0;
        }
    }
}