using NEST_App.DAL;
using NEST_App.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

namespace NEST_App.Controllers
{
    public class DetailViewController : Controller
    {
        private NestContainer db = new NestContainer();

        // GET: /DetailView/
        public ActionResult Index()
        {
            dynamic uavDetailList = new System.Dynamic.ExpandoObject();
            uavDetailList.UAVs = db.UAVs.ToList();
            uavDetailList.FlightStates = db.FlightStates.ToList();
            uavDetailList.missions = db.Missions.ToList();
            uavDetailList.Configurations = db.Configurations.ToList();
            uavDetailList.Eventlog = db.EventLogs.ToList();

            string name = (string)Session["current_user"];

            if(name != null)
            {
                var curUser = (from u in db.Users
                               where u.username.Equals(name)
                              select new
                              {
                                  username = u.username,
                                  user_id = u.user_id,
                              }).FirstOrDefault();
                    ViewBag.currentUser = curUser;
            }

            return View(uavDetailList);
        }
    }
}
