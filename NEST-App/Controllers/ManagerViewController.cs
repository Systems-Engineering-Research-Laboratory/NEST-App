using NEST_App.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace NEST_App.Controllers
{
    public class ManagerViewController : Controller
    {
        private NestContainer db = new NestContainer();

        // GET: ManagerView
        public ActionResult Index()
        {
            dynamic uavManagerList = new System.Dynamic.ExpandoObject();
            uavManagerList.UAVs = db.UAVs.ToList();
            uavManagerList.Eventlog = db.EventLogs.ToList();
            uavManagerList.Operator = db.UserRoles.ToList();

            return View(uavManagerList);
        }
    }
}