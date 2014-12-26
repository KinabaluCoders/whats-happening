jQuery(document).ready(function($){

    function debug_random_event()
    {
        var timelineConfiguration = $("#timeline").data("timelineConfiguration");

        var minimum_date = timelineConfiguration.pastDate;
        var maximum_date = timelineConfiguration.futureDate;

        var event_date = debugGenerate_randomDate(minimum_date, maximum_date);
        var event =
        {
            Date: event_date,
            title: debugGenerate_loremIpsum(100, 3)
        };
        return event;
    }

    function debug_add_random_event(animate)
    {
        var random_event = debug_random_event();

        $("#timeline").trigger("addEvent.timeline", [random_event, animate]);
    }

    $("#debug-add-event")
        .show()
        .css("position", "fixed")
        .click(function(e){
            debug_add_random_event(true);
        });

    for(var i=0; i < 50; i++)
    {
        debug_add_random_event();
    }

});