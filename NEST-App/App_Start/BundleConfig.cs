using BundleTransformer.Core.Bundles;
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

            var signalRBundle = new CustomScriptBundle("~/bundles/jquery-signalR");
            jqueryBundle.Include("~/Scripts/jquery.signalR-{version}.js", "~/Scripts/jquery.signalR-{version}.min.js");
            jqueryBundle.Transforms.Add(jsTransformer);
            jqueryBundle.Orderer = nullOrderer;
            bundles.Add(signalRBundle);

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
            bootstrapBundle.Include("~/Scripts/bootstrap.js", "~/Scripts/bootstrap.min.js", "~/Scripts/respond.js");
            bootstrapBundle.Transforms.Add(jsTransformer);
            bootstrapBundle.Orderer = nullOrderer;
            bundles.Add(bootstrapBundle);

            var bootstrapLess = new CustomStyleBundle("~/bundles/bootstrapLess");
            bootstrapLess.Include("~/Content/bootstrap/bootstrap.less");
            bootstrapLess.Transforms.Add(cssTransformer);
            bootstrapLess.Orderer = nullOrderer;
            bundles.Add(bootstrapLess);

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

            //Angular Scripts Bundle
            var angularJS = new CustomScriptBundle("~/bundles/angular");
            angularJS.Include("~/Scripts/angular-route.js");
            angularJS.Include("~/Scripts/angular-resource.js");
            angularJS.Include("~/Scripts/angular-animate.js");
            angularJS.Include("~/Scripts/angular.js");
            angularJS.Include("~/Controllers/app/js/admin_page/admin_page.app.js");
            angularJS.Include("~/Controllers/app/js/admin_page/controllers/admin.ctrl.js");
            angularJS.Transforms.Add(jsTransformer);
            angularJS.Orderer = nullOrderer;
            bundles.Add(angularJS);

            //Font Awesome
            //var fa = new CustomStyleBundle("~/bundles/fontawesome");
            //fa.Include("~/Content/font-awesome-4.3.0/css/font-awesome.min.css");
            //fa.Include("~/Content/font-awesome-4.3.0/fonts/font-awesome.webfont.woff");
            //bundles.Add(fa);
        }
    }
}
