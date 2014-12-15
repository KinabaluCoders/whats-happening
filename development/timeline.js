$(document).ready(function() {
    var $container = $("#basic");

    function initialise_shapeshift()
    {
        $container.shapeshift({
            selector: ".item",
            animated: true,
            enableDrag: false,
            enableCrossDrop: false,
            gutterX: 0,
            gutterY: 0,
            paddingX: 0,
            paddingY: 0,
            align: "center"
        })
    }

    function render_months()
    {
        console.log('rendering months...');

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
    }

    // source: http://davidwalsh.name/javascript-debounce-function
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    ratelimited_render_months = debounce(render_months, 500);
    $container.on("ss-arranged", function(e){
        ratelimited_render_months();
    });

    initialise_shapeshift();

    $container.trigger("ss-arranged");

    $("#reset-timeline").click(function(e){
        $container.trigger("ss-destroy");
        initialise_shapeshift();
        return false;
    });

    $("#randomise-heights").click(function(e){
        $container.find(".item").each(function(i, item){
            var $item = $(item);
            $item.css("height", (Math.random() * (200 - 30) + 30) + "px");
        });
        $container.trigger("ss-destroy");
        initialise_shapeshift();
        return false;
    });

})