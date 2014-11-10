GM_registerMenuCommand('Run blocker', function() { 
  // main()
    
    var highest = -999;

    $("*").each(function() {
        var current = parseInt($(this).css("z-index"), 10);
        if(current && highest < current) highest = current;
    });
    
    $('body').append('<div style="background-color:#000;" id="cc_overlay"></div>');
    
    $("#cc_overlay").css("position", "absolute").css("top", 0).css("left", 0).css("z-index", highest)
    .css("min-height","100%").css("width","100%");
     
    $("#cc_overlay").click(function(){
        $(this).hide(250);
        $("#CP").show(250);
    });

	$('body').append('<input type="button" value="block" id="CP">');
	$("#CP").css("position", "absolute").css("top", 0).css("left", 0).css("z-index", highest+1);
    $('#CP').hide();
    
    $('#CP').click(function(){ 
        $("#cc_overlay").show(250);
        $(this).hide(250);
    });

}, 'r');
