using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NEST_App.Models;

namespace NEST_App.Controllers
{
    public class MapController : Controller
    {

        private NestContainer db = new NestContainer();
        //
        // GET: /Map/Overview
        public ActionResult Overview()
        {
            return View();
        }

        // GET: /Map/GoogleMap
        public ActionResult GoogleMap()
        {
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

                if (curUser != null)
                {
                    var assignedUavs = (from u in db.UAVs
                                       where u.User_user_id == curUser.user_id
                                        select u.Id).ToList();


                    ViewBag.currentUser = curUser;
                    ViewBag.assignedUavs = assignedUavs;
                }
            }

            return View();
        }
	}
}