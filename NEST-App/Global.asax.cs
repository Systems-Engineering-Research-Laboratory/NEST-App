using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using NEST_App.DAL;
using AutoMapper;

using NEST_App.Models;
using System.Data.Entity;

namespace NEST_App
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            //initializing database the correct CMD_NAV_Waypoint -- varatep 
#if DEBUG
            Database.SetInitializer<NestContainer>(new NestDatabaseInitializer());
#endif
            //NestDatabaseInitializer dbInit = new NestDatabaseInitializer();
            //dbInit.InitializeDatabase();

            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            //Remove XML
            GlobalConfiguration.Configuration.Formatters.Remove(GlobalConfiguration.Configuration.Formatters.XmlFormatter);
            
            //Inserted by Jeff to configure automapper
            Mapper.CreateMap<FlightState, FlightStateDTO>()
                .ForMember(dest => dest.Latitude, opt => opt.ResolveUsing<FlightStateLatResolver>())
                .ForMember(dest => dest.Longitude, opt => opt.ResolveUsing<FlightStateLonResolver>())
                .ForMember(dest => dest.Altitude, opt => opt.ResolveUsing<FlightStateAltResolver>());
        }
    }
}
