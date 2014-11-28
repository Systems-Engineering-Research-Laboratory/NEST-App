using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using NEST_App.Models;

namespace NEST_App.Hubs
{
    public class VehicleHub : Hub
    {
        public void pushFlightStateUpdate(FlightStateDTO dto){
            Clients.All.flightStateUpdate(dto);
        }
    }
}