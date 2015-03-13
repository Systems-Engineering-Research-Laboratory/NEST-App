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

            return View(uavManagerList);

        }
        // GET: AdminView/ManageUAVs
        public ActionResult ManageUAVs()
        {
            var UAVs = (from uav in db.UAVs select uav).ToList();
            return View(UAVs);
        }
        // GET: AdminView/Assignments
        public ActionResult ManageAssignments()
        {
            return View();
        }
        // GET: AdminView/Assignments/{id}
        public ActionResult EditAssignment()
        {
            return View();
        }
    }
}