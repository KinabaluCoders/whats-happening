jQuery(document).ready(function($){

    function parse_google_calendar_v2_basic_feed(source_url, item_callback)
    {
        jQuery.getJSON(source_url, function(data)
        {
            $.each(data.feed.entry, function(i, item)
            {
                var gcalevent = {
                    'title': item.title.$t,
                    'content': $.trim(item.content.$t),
                    // determine these later...
                    'datetimeStart': false,
                    'allDay': true,
                    'textDateStart': "",
                    'textTimeStart': ""
                };

                var _matches = gcalevent.content.match(/When:\s?(.*?)<br\s?\/?>/);
                if(_matches[1])
                {
                    gcalevent.datetimeStart = new Date(_matches[1]);
                }

                item_callback(gcalevent);
            });
        });
    }

    /* debug integration with timeline */

    var v2feed_url = "https://www.google.com/calendar/feeds/en.malaysia%23holiday%40group.v.calendar.google.com/public/basic?futureevents=true&alt=json&orderby=starttime&sortorder=ascending";

    var $timeline = $("#timeline");
    if($timeline.length > 0)
    {
        var timelineConfiguration = $timeline.data("timelineConfiguration");

        parse_google_calendar_v2_basic_feed(v2feed_url, function(gcalevent)
        {
            // XXX: debug filtering 

            var NOW = new Date();
            var minimum_date = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
            var maximum_date = timelineConfiguration.futureDate;

            if(gcalevent.datetimeStart < minimum_date) return true;
            if(gcalevent.datetimeStart > maximum_date) return true;

            // add event to timeline

            gcalevent.classes = ["holiday"];
            gcalevent.Date = gcalevent.datetimeStart;
            $("#timeline").trigger("addEvent.timeline", [gcalevent, true]);
        });
    }
    else
    {
        parse_google_calendar_v2_basic_feed(v2feed_url, function(gcalevent){
            console.log(gcalevent);
        });
    }
});
