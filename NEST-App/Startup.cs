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
            app.MapSignalR();
        }
    }
}
