using NEST_App.DAL;
using NEST_App.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

namespace NEST_App.Controllers
{
    public class ScheduleViewController : Controller
    {
        private NestDbContext db = new NestDbContext();

        // GET: ScheduleView
        public ActionResult Index()
        {
            var scheds = db.Schedules.ToList();
            return View(scheds);
        }
    }
}