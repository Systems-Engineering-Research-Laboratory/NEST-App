﻿using BundleTransformer.Core.Bundles;
using BundleTransformer.Core.Orderers;
using BundleTransformer.Core.Transformers;
using System.Web;
using System.Web.Optimization;

namespace NEST_App
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            BundleTable.EnableOptimizations = false;

            bundles.UseCdn = true;
            var cssTransformer = new CssTransformer();
            var jsTransformer = new JsTransformer();
            var nullOrderer = new NullOrderer();

            var cssBundle = new CustomStyleBundle("~/bundles/css");
            cssBundle.Include("~/Content/Site.less", "~/Content/bootstrap/bootstrap.less");
            cssBundle.Transforms.Add(cssTransformer);
            cssBundle.Orderer = nullOrderer;
            bundles.Add(cssBundle);

            var jqueryBundle = new CustomScriptBundle("~/bundles/jquery");
            jqueryBundle.Include("~/Scripts/jquery-{version}.js");
            jqueryBundle.Transforms.Add(jsTransformer);
            jqueryBundle.Orderer = nullOrderer;
            bundles.Add(jqueryBundle);

            var jqueryvalBundle = new CustomScriptBundle("~/bundles/jqueryval");
            jqueryvalBundle.Include("~/Scripts/jquery.validate*");
            jqueryvalBundle.Transforms.Add(jsTransformer);
            jqueryvalBundle.Orderer = nullOrderer;
            bundles.Add(jqueryvalBundle);


            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.

            var modernizrBundle = new CustomScriptBundle("~/bundles/modernizr");
            modernizrBundle.Include("~/Scripts/modernizr-*");
            modernizrBundle.Transforms.Add(jsTransformer);
            modernizrBundle.Orderer = nullOrderer;
            bundles.Add(modernizrBundle);


            var bootstrapBundle = new CustomScriptBundle("~/bundles/bootstrap");
            bootstrapBundle.Include("~/Scripts/bootstrap.js", "~/Scripts/respond.js");
            bootstrapBundle.Transforms.Add(jsTransformer);
            bootstrapBundle.Orderer = nullOrderer;
            bundles.Add(bootstrapBundle);

            //Google Map CSS bundle
            var googMapCSS = new CustomStyleBundle("~/bundles/googMapCSS");
            googMapCSS.Include("~/Content/Map/GOOG/*.css");
            googMapCSS.Transforms.Add(cssTransformer);
            googMapCSS.Orderer = nullOrderer;
            bundles.Add(googMapCSS);
            
            //Google Map JS bundle
            var googMapJS = new CustomScriptBundle("~/bundles/googMapJS");
            googMapJS.Include("~/Content/Map/GOOG/*.js");
            googMapJS.Transforms.Add(jsTransformer);
            googMapJS.Orderer = nullOrderer;
            bundles.Add(googMapJS);

            //Open Layers Map CSS bundle
            var olMapCSS = new CustomStyleBundle("~/bundles/olMapCSS");
            olMapCSS.Include("~/Content/Map/OL/*.css");
            olMapCSS.Transforms.Add(cssTransformer);
            olMapCSS.Orderer = nullOrderer;
            bundles.Add(olMapCSS);

            //Open Layers Map JS bundle
            var olMapJS = new CustomScriptBundle("~/bundles/olMapJS");
            olMapJS.Include("~/Content/Map/OL/*.js");
            olMapJS.Transforms.Add(jsTransformer);
            olMapJS.Orderer = nullOrderer;
            bundles.Add(olMapJS);
        }
    }
}
