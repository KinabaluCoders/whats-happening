jQuery(document).ready(function($){

    // var source_url = "http://127.0.0.1/projects/events-planet/output/simple-unified.json"
    var source_url = "http://events.sabah.io/output/json_callback.php?callback=?"

    jQuery.getJSON(source_url, function(data)
    {
        var $timeline = $("#timeline");
        $.each(data, function(key, event)
        {
            feeditem = {};
            feeditem.classes = ["event"];
            feeditem.Date = new Date(event.start * 1000);
            feeditem.title = event.title;
            feeditem._visibleContent = event.description;
            $timeline.trigger("addEvent.timeline", [feeditem, true]);
        });
    });

});
