using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using NEST_App.Models;
using NEST_App.DAL;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Collections;

namespace NEST_App.Hubs
{
    public class VehicleHub : Hub
    {
        static Dictionary<string, int> activeConnections = new Dictionary<string, int>();
        private List<UAV> batteryWarning = new List<UAV>();
        private NestContainer db = new NestContainer();
        private int events = 1;
        /* Pair a signalR connection ID with a user;
         * Since a user can have multiple connections, the connection
         * is the key and the user ID is the paired value
        */
        public void AddConnection(int userID)
        {
            string connID = Context.ConnectionId;
            activeConnections.Add(connID, userID);
        }

        public void UavWasAssigned(UAV uav)
        {
            Clients.All.uavWasAssigned(uav);
        }

        public void UavWasRejected(UAV uav)
        {
            Clients.All.uavWasRejected(uav);
        }

        public Task JoinGroup(string groupName){
            return Groups.Add(Context.ConnectionId, groupName);
        }

        public Task LeaveGroup(string groupName)
        {
            return Groups.Remove(Context.ConnectionId, groupName);
        }

        public void PushFlightStateUpdate(FlightStateDTO dto){
            var eventHub = GlobalHost.ConnectionManager.GetHubContext<EventLogHub>();
            UAV uav = db.UAVs.FirstOrDefault(x => x.Id == dto.Id);
            double lat = Math.Round(dto.Latitude * 10000) / 10000;
            double lon = Math.Round(dto.Longitude * 10000) / 10000;

            //if the uav landed at 'base', remove from list -- allows sending warning again
            if (lat == 34.2420 && lon == -118.5288)
                batteryWarning.Remove(uav);

            //look up the uav
            var index = batteryWarning.IndexOf(uav);
            //it's not in the list
            if( index == -1 ) {
                if (dto.BatteryLevel < .2)
                {
                    //add list -- stops from sending warning everytime
                    batteryWarning.Add(uav);
                   
                    EventLog evt = new EventLog();
                        evt.event_id = events;
                        evt.uav_id = uav.Id;
                        evt.uav_callsign = uav.Callsign;
                        evt.criticality = "critical";
                        evt.message = "Low Battery";
                        evt.create_date = DateTime.Now;
                        evt.modified_date = DateTime.Now;
                        //wtf seriously? -- why is this in here twice...
                        evt.UAVId = uav.Id;
                        evt.operator_screen_name = uav.User.ToString();
                        eventHub.Clients.All.newEvent(evt);

                    db.EventLogs.Add(evt);
                    events++;
                    try
                    {
                        db.SaveChangesAsync();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        throw;
                    }
                }
            }

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

        public int GotoCommand(CMD_NAV_Target cmd)
        {
            using (var db = new NestContainer())
            {
                Clients.Group("vehicles").sendTargetCommand(cmd, Context.ConnectionId);
                return cmd.Id;
            }
        }

        public int HoldCommand(CMD_NAV_Hold cmd)
        {  
                Clients.Group("vehicles").sendHoldCommand(cmd, Context.ConnectionId);
                System.Diagnostics.Debug.WriteLine("ID is: " + cmd.Id);
                System.Diagnostics.Debug.WriteLine("Context ID is: " + Context.ConnectionId);
                return cmd.Id;
         }
        

        public int LandCommand(CMD_NAV_Land cmd)
        {
                Clients.Group("vehicles").sendLandCommand(cmd, Context.ConnectionId);
                return cmd.Id;   
        }

        public int ReturnCommand(CMD_NAV_Return cmd)
        {
            Clients.Group("vehicles").sendReturnCommand(cmd, Context.ConnectionId);
                return cmd.Id;
        }

        public int AdjustCommand(CMD_NAV_Adjust cmd)
        {
                Clients.Group("vehicles").sendAdjustCommand(cmd, Context.ConnectionId);
                return cmd.Id;
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

        public void vehicleHasNewMission(int uavId, int schedId, int missionId)
        {
            Clients.All.vehicleHasNewMission(uavId, schedId, missionId);
        }

        public void NotifySelected(int uavId, bool selected, int userID)
        {

            var connectionIDs = activeConnections.Where(p => p.Value == userID).Select(p => p.Key);
            foreach (var id in connectionIDs)
            {
                    Clients.Client(id).changeSelected(uavId, selected);
            }
        }

        public async Task BroadcastAcceptedCommand(CMD_ACK ack)
        {
            NestContainer db = new NestContainer();
            {
                switch (ack.CommandType)
                {
                    case "CMD_NAV_Target":
                        CMD_NAV_Target target = await db.CMD_NAV_Target.FindAsync(ack.CommandId);
                        if (target != null && ack.Accepted == true)
                        {
                            target.Acked = true;
                            Clients.All.targetCommandAccepted(target);
                            db.Entry(target).State = EntityState.Modified;
                            await db.SaveChangesAsync();
                        }
                        break;
                    case "CMD_NAV_Hold":
                        CMD_NAV_Hold hold = await db.CMD_NAV_Hold.FindAsync(ack.CommandId);
                        if (hold != null && ack.Accepted == true)
                        {
                            hold.Acked = true;
                            Clients.All.targetCommandAccepted(hold);
                            db.Entry(hold).State = EntityState.Modified;
                            await db.SaveChangesAsync();
                        }
                        break;
                    case "CMD_NAV_Return":
                        CMD_NAV_Return goBack = await db.CMD_NAV_Return.FindAsync(ack.CommandId);
                        if (goBack != null && ack.Accepted == true)
                        {
                            goBack.Acked = true;
                            Clients.All.targetCommandAccepted(goBack);
                            db.Entry(goBack).State = EntityState.Modified;
                            await db.SaveChangesAsync();
                        }
                        break;
                    case "CMD_NAV_Land":
                        CMD_NAV_Land land = await db.CMD_NAV_Land.FindAsync(ack.CommandId);
                        if (land != null && ack.Accepted == true)
                        {
                            land.Acked = true;
                            Clients.All.targetCommandAccepted(land);
                            db.Entry(land).State = EntityState.Modified;
                            await db.SaveChangesAsync();
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
}