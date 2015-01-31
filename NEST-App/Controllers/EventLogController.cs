using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NEST_App.Models;


namespace NEST_App.Controllers
{
    public class EventLogController : Controller
    {
        // GET: EventLog
        public ActionResult Index()
        {
            return View();
        }
    }
}