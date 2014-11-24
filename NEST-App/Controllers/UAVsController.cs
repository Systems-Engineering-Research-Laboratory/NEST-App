using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using NEST_App.DAL;
using NEST_App.Models;

namespace NEST_App.Controllers
{
    public class UAVsController : Controller
    {
        private NestDbContext db = new NestDbContext();

        // GET: UAVs
        public ActionResult Index()
        {
            dynamic uavDetailList = new System.Dynamic.ExpandoObject();
            uavDetailList.UAVs = db.OwnshipVehicles.ToList();
            uavDetailList.FlightStates = db.FlightStates.ToList();
            return View(uavDetailList);
        }

        // GET: UAVs/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UAV uAV = db.OwnshipVehicles.Find(id);
            if (uAV == null)
            {
                return HttpNotFound();
            }
            return View(uAV);
        }

        // GET: UAVs/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: UAVs/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "Id,Callsign,NumDeliveries,Mileage")] UAV uAV)
        {
            if (ModelState.IsValid)
            {
                db.OwnshipVehicles.Add(uAV);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(uAV);
        }

        // GET: UAVs/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UAV uAV = db.OwnshipVehicles.Find(id);
            if (uAV == null)
            {
                return HttpNotFound();
            }
            return View(uAV);
        }

        // POST: UAVs/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "Id,Callsign,NumDeliveries,Mileage")] UAV uAV)
        {
            if (ModelState.IsValid)
            {
                db.Entry(uAV).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(uAV);
        }

        // GET: UAVs/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            UAV uAV = db.OwnshipVehicles.Find(id);
            if (uAV == null)
            {
                return HttpNotFound();
            }
            return View(uAV);
        }

        // POST: UAVs/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            UAV uAV = db.OwnshipVehicles.Find(id);
            db.OwnshipVehicles.Remove(uAV);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
