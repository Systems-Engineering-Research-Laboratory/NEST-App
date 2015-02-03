using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace NEST_App
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            config.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling 
                = Newtonsoft.Json.ReferenceLoopHandling.Ignore;

            // Web API routes
            // Jeff - My VS says it can't find this, but it still runs and it works. Don't listen to VS's lies.
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
