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
    public class ScheduleViewController : Controller
    {
        private NestContainer db = new NestContainer();

        // GET: ScheduleView
        public ActionResult Index()
        {
            dynamic uavScheduleList = new System.Dynamic.ExpandoObject();
            uavScheduleList.UAVs = db.UAVs.ToList();
            uavScheduleList.missions = db.Missions.ToList();
            uavScheduleList.sched = db.Schedules.ToList();
            uavScheduleList.maint = db.Maintenances.ToList();



            //var scheds = from s in db.Schedules.Include(s => s.Missions).Include(s=> s.Maintenances) select s;
            //return View(scheds);
            return View(uavScheduleList);
        }
    }
}