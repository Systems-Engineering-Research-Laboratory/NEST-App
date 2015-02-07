using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NEST_App.Models;
using NEST_App.DAL;

namespace NEST_App.Controllers
{
    public class AdminViewController : Controller
    {
        private NestContainer db = new NestContainer();

        // GET: AdminView
        public ActionResult Index()
        {
            return View();
        }
        // GET: AdminView/ManageUsers
        public ActionResult ManageUsers()
        {
            var Users = (from usr in db.Users select usr).ToList();
            return View(Users);
        }
        // GET: AdminView/EditUser/{id}
        public ActionResult EditUser(int id)
        {
            return View();
        }
        // GET: AdminView/ManageUAVs
        public ActionResult ManageUAVs()
        {
            var UAVs = (from uav in db.UAVs select uav).ToList();
            return View(UAVs);
        }
        // GET: AdminView/ManageUAVs/{id}
        public ActionResult EditUAV()
        {
            return View();
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