using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using NEST_App.Models;
using Microsoft.AspNet.SignalR.Hubs;
using NEST_App.DAL;
using System.Collections.Concurrent;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace NEST_App.Hubs
{
    [HubName("eventLogHub")]
    public class EventLogHub : Hub
    {
        private static ConcurrentDictionary<string, List<int>> _mapping = new ConcurrentDictionary<string, List<int>>();
        private NestContainer db = new NestContainer();

        public override System.Threading.Tasks.Task OnConnected()
        {
            _mapping.TryAdd(Context.ConnectionId, new List<int>());
            Clients.All.newConnection(Context.ConnectionId);
            Clients.All.hello("hello world");
            return base.OnConnected();
        }
        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            //foreach (var id in _mapping[Context.ConnectionId])
            //{
            //    UnlockHelper(id);
            //}
            var list = new List<int>();
            _mapping.TryRemove(Context.ConnectionId, out list);
            Clients.All.removeConnection(Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }
        public void Emit(JObject eventLog)
        {
            EventLog evt = eventLog.ToObject<EventLog>();
            //EventLog evt = eventLog;
            evt.create_date = DateTime.Now;
            evt.modified_date = DateTime.Now;
            Clients.All.newEvent(evt);
        }
        public void Hello()
        {
            Clients.All.newEvent(new EventLog {
                event_id = 1,
                uav_id = 1,
                uav_callsign = "Hawk001",
                criticality = "major",
                message = "Hello world",
                create_date = DateTime.Now,
                modified_date = DateTime.Now
            });
        }
        public void Unlock(int id)
        {
            UnlockHelper(id);
            _mapping[Context.ConnectionId].Remove(id);
        }
        private void UnlockHelper(int id)
        {
            
        }

        public void SendNote(double lat, double lng, string notifier, string message)
        {
            Clients.All.showNote(lat, lng, notifier, message);
        }
    }
}