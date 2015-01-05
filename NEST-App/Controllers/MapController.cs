using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace NEST_App.Controllers
{
    public class MapController : Controller
    {
        //
        // GET: /Map/Overview
        public ActionResult Overview()
        {
            return View();
        }

        // GET: /Map/GoogleMap
        public ActionResult GoogleMap()
        {
            return View();
        }
	}
}