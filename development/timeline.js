$(document).ready(function() {
    var $container = $("#basic");

    function initialise_shapeshift()
    {
        $container.shapeshift({
            selector: ".item",
            animated: false,
            enableDrag: false,
            enableCrossDrop: false,
            gutterX: 0,
            gutterY: 0,
            paddingX: 0,
            paddingY: 0,
            align: "center"
        })
    }
    
    $container.on("ss-arranged", function(e){
        // console.log("arranged");

        $container.find(".-month-zone").remove();

        var markers = $container.find(".-month-marker");

        zones = [];
        for(var i=1; i < markers.length; i++)
        {
            var $prev_marker = $(markers[i-1]);
            var $marker = $(markers[i]);

            // console.log($prev_marker.position(), $marker.position());

            zones.push([$prev_marker.position().top, $marker.position().top - $prev_marker.position().top]);
        }
        zones.push([$marker.position().top, $container.innerHeight() - $marker.position().top]);

        for(var i=0; i < zones.length; i++)
        {
            // console.log(zones[i]);

            var zone = $('<div class="-month-zone"></div>');
            zone.css({
                "position": "absolute",
                "top": zones[i][0] + "px",
                "height": zones[i][1] + "px",
                "left" : "0px",
                "width" : "100%"
            });

            zone.appendTo($container)
        }
    });

    initialise_shapeshift();
    $container.trigger("ss-arranged");

    /*
    var current_window_width = 0;
    $(window).resize(function(e){
        previous_window_width = current_window_width;
        current_window_width = $(window).innerWidth();
        if(current_window_width <= 375 && previous_window_width > 375)
        {
            console.log("portable");
            $container.trigger("ss-destroy");
            setTimeout(initialise_shapeshift, 500);
        }
        else if(current_window_width >= 375 && previous_window_width < 375)
        {
            console.log("wide");
            $container.trigger("ss-destroy");
            setTimeout(initialise_shapeshift, 500);
        }
    });
    */

    $("#reset-timeline").click(function(e){
        $container.trigger("ss-destroy");
        initialise_shapeshift();
        return false;
    });
})