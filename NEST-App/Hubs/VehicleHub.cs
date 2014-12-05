using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using NEST_App.Models;


namespace NEST_App.Hubs
{
    public class VehicleHub : Hub
    {

        public Task joinGroup(string groupName){
            return Groups.Add(Context.ConnectionId, groupName);
        }

        public Task LeaveGroup(string groupName)
        {
            return Groups.Remove(Context.ConnectionId, groupName);
        }

        public void pushFlightStateUpdate(FlightStateDTO dto){
            Clients.All.flightStateUpdate(dto);
        }

        public void sendCommand(CMD_NAV_Target target)
        {
            Clients.Group("vehicles").sendTargetCommand(target, Context.ConnectionId);
        }

        public void AckCommand(CMD_ACK ack, string connectionId)
        {
            Clients.Client(connectionId).Acknowledgement(ack);
        }
    }
}