using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
//Import spatial for dbGeography
using System.Data.Entity.Spatial;
using AutoMapper;

namespace NEST_App.Models
{
    public class FlightStateDTO
    {
        public int Id { get; set; }
        public System.DateTime Timestamp { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double Altitude { get; set; }
        public double VelocityX { get; set; }
        public double VelocityY { get; set; }
        public double VelocityZ { get; set; }
        public double Yaw { get; set; }
        public double Roll { get; set; }
        public double Pitch { get; set; }
        public double YawRate { get; set; }
        public double RollRate { get; set; }
        public double PitchRate { get; set; }
        public double BatteryLevel { get; set; }
        public int UAVId { get; set; }

        public FlightStateDTO()
        {
        }

        public void buildDTO(FlightState fs)
        {
            if(fs != null)
            {
                this.Id = fs.Id;
                this.Timestamp = fs.Timestamp;
                this.Latitude = fs.Position.Latitude.GetValueOrDefault();
                this.Longitude = fs.Position.Longitude.GetValueOrDefault();
                this.Altitude = fs.Position.Elevation.GetValueOrDefault();
                this.VelocityX = fs.VelocityX;
                this.VelocityY = fs.VelocityY;
                this.VelocityZ = fs.VelocityZ;
                this.Yaw = fs.Yaw;
                this.Roll = fs.Roll;
                this.Pitch = fs.Pitch;
                this.YawRate = fs.YawRate;
                this.RollRate = fs.RollRate;
                this.PitchRate = fs.PitchRate;
                this.BatteryLevel = fs.BatteryLevel;
            }
        }
    }

    public class FlightStateLatResolver : ValueResolver<FlightState, double>
    {
        protected override double ResolveCore(FlightState fs)
        {
            return fs.Position.Latitude.GetValueOrDefault();
        }
    }

    public class FlightStateLonResolver : ValueResolver<FlightState, double>
    {
        protected override double ResolveCore(FlightState fs)
        {
            return fs.Position.Longitude.GetValueOrDefault();
        }
    }

    public class FlightStateAltResolver : ValueResolver<FlightState, double>
    {
        protected override double ResolveCore(FlightState fs)
        {
            return fs.Position.Elevation.GetValueOrDefault();
        }
    }

    

    public class FlightStatePosResolver : ValueResolver<FlightStateDTO, DbGeography>
    {
        protected override DbGeography ResolveCore(FlightStateDTO source)
        {
            var point = string.Format("POINT({1} {0} {2})", source.Latitude, source.Longitude, source.Altitude);

            return DbGeography.FromText(point);
        }
    }
}