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

        public Task JoinGroup(string groupName){
            return Groups.Add(Context.ConnectionId, groupName);
        }

        public Task LeaveGroup(string groupName)
        {
            return Groups.Remove(Context.ConnectionId, groupName);
        }

        public void PushFlightStateUpdate(FlightStateDTO dto){
            Clients.All.flightStateUpdate(dto);
            // flightstatedto entity is not the same as models in our db context. can not guarantee atomic. need to wipe out flightstatedto
        }

        public void SendCommand(CMD_NAV_Target target)
        {
            Clients.Group("vehicles").sendTargetCommand(target, Context.ConnectionId);
        }

        public void AckCommand(CMD_ACK ack, string connectionId)
        {
            Clients.Client(connectionId).Acknowledgement(ack);
        }

        public void AssignMission(int UAVId, int MissionId)
        {
            Clients.All.AssignMission(UAVId, MissionId);
        }
    }
}