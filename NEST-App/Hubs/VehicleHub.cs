using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using NEST_App.Models;
using NEST_App.DAL;


namespace NEST_App.Hubs
{
    public class VehicleHub : Hub
    {
        private readonly static ConnectionMapping<string> connections =
            new ConnectionMapping<string>();

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

        /**
         * Returns -1 if the insertion into the database failed.
         */
        public int SendCommand(CMD_NAV_Target target)
        {
            using (var db = new NestContainer())
            {
                target = db.CMD_NAV_Target.Add(target);
                int result = db.SaveChanges();
                if (result == 1)
                {
                    //The target was added, so send the target command to the vehicles.
                    Clients.Group("vehicles").sendTargetCommand(target, Context.ConnectionId);
                    //Return the target ID so they know what the ID is in the database.
                    return target.Id;
                }
                else
                {
                    //Not added, return, let caller know
                    return -1;
                }
            }
        }

        public async void AckCommand(CMD_ACK ack, string connectionId)
        {
            Clients.Client(connectionId).Acknowledgement(ack);
            await BroadcastAcceptedCommand(ack);
        }

        public void AssignMission(int UAVId, int MissionId)
        {
            Clients.All.AssignMission(UAVId, MissionId);
        }

        public void newRestrictedArea(MapRestricted res)
        {
            Clients.All.newRestrictedArea(res);
        }

        public async Task BroadcastAcceptedCommand(CMD_ACK ack)
        {
            using (var context = new NestDbContext())
            {
                switch (ack.CommandType)
                {
                    case "CMD_NAV_Target":
                        CMD_NAV_Target target = await context.CMD_NAV_Target.FindAsync(ack.CommandId);
                        if (target != null)
                        {
                            Clients.All.targetCommandAccepted(target);
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        public override Task OnConnected()
        {
            string name = (string)System.Web.HttpContext.Current.Cache["current_user"];

            if(name != null)
                connections.Add(name, Context.ConnectionId);

            return base.OnConnected();
        }
    }
}