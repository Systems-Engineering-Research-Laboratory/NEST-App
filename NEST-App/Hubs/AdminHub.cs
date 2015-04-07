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
    [HubName("adminHub")]
    public class adminHub : Hub
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
            var list = new List<int>();
            _mapping.TryRemove(Context.ConnectionId, out list);
            Clients.All.removeConnection(Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }

        public void Emit(JObject batteryDrop)
        {
            Clients.All.newDrop(batteryDrop);
        }
    }
}