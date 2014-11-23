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

namespace NEST_App
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            //Inserted by Jeff to configure automapper
            Mapper.CreateMap<FlightState, FlightStateDTO>()
                .ForMember(dest => dest.Latitude, opt => opt.ResolveUsing<FlightStateLatResolver>())
                .ForMember(dest => dest.Longitude, opt => opt.ResolveUsing<FlightStateLonResolver>())
                .ForMember(dest => dest.Altitude, opt => opt.ResolveUsing<FlightStateAltResolver>());
            Mapper.CreateMap<FlightStateDTO, FlightState>()
                .ForMember(dest => dest.Position, opt => opt.ResolveUsing<FlightStatePosResolver>());
        }
    }
}
