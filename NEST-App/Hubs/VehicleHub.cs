using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace NEST_App.Hubs
{
    public class VehicleHub : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }
    }
}