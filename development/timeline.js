$(document).ready(function() {
    var $container = $("#basic");

    $container.shapeshift({
        selector: ".item",
        animated: false,
        enableDrag: false,
        enableCrossDrop: false
    })
    
    $container.on("ss-arranged", function(e){
        console.log("arranged");

        $container.find(".-month-zone").remove();

        var markers = $container.find(".-month-marker");

        zones = [];
        for(var i=1; i < markers.length; i++)
        {
            var $prev_marker = $(markers[i-1]);
            var $marker = $(markers[i]);

            console.log($prev_marker.position(), $marker.position());

            zones.push([$prev_marker.position().top, $marker.position().top - $prev_marker.position().top]);
        }
        zones.push([$marker.position().top, $container.innerHeight() - $marker.position().top]);

        for(var i=0; i < zones.length; i++)
        {
            console.log(zones[i]);

            var zone = $('<div class="-month-zone"></div>');
            zone.css({
                "position": "absolute",
                "top": zones[i][0] + "px",
                "height": zones[i][1] + "px",
                "width": "100%"
            });

            zone.appendTo($container)
        }
    });

    $container.trigger("ss-arranged");
})