using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Results;
using System.Web.Mvc;
using System.Web.Caching;

namespace NEST_App.Controllers
{
    public class LoginController : Controller
    {
        // GET: Login
        public ActionResult Index()
        {
            return View();
        }

        [System.Web.Http.HttpPost]
        public ActionResult Login(string username)
        {
            Session["current_user"] = username;
            Session.Timeout = 1440;
            return RedirectToAction("Index", "Home");
        }
    }
}