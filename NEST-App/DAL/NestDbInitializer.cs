using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using NEST_App.Models;

namespace NEST_App.DAL
{
    public class NestDbInitializer : System.Data.Entity.DropCreateDatabaseAlways<NestDbContext>
    {
        protected override void Seed(NestDbContext context)
        {
            var UAVs = new List<UAV>
            {
                new UAV{Callsign = "HAWK21", NumDeliveries = 2134, Mileage = 234}
            };
            UAVs.ForEach(s => context.OwnshipVehicles.Add(s));
            context.SaveChanges();
        }
    }
}