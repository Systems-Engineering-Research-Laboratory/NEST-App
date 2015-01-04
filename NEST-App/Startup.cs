using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(NEST_App.Startup))]
namespace NEST_App
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            var hubConfig = new HubConfiguration();
            hubConfig.EnableDetailedErrors = true;
            hubConfig.EnableJavaScriptProxies = true;
            app.MapSignalR("/signalr", hubConfig);
        }
    }
}
