using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NEST_App.Models;

namespace NEST_App.DAL
{
    public class NestDatabaseInitializer : System.Data.Entity.DropCreateDatabaseAlways<VehicleModelContainer>
    {
        protected override void Seed(VehicleModelContainer DBContext)
        {
            // We can initialize everything here and store it into the database
            var uavs = new List<UAV>
            {
            };
            //for (int i = 0; i < 500; i++)
            //{
            //    uavs.Add(new UAV 
            //    { 
            //        Callsign= "HAWK" + i.ToString(),
            //        Configurations= ,
            //        create_date='',
            //        EuipmentHealths='',
            //        FlightStates='',
            //        Mileage='',
            //        modified_date='',
            //        NumDeliveries='',
            //        Schedules=''
            //    });
            //}

            // loop through and add UAV x 500
            // then add the required objects


            // not needed
            //base.Seed(context);
        }
    }
}