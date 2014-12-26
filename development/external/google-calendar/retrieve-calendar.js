jQuery(document).ready(function($){

    var source_url = "https://www.google.com/calendar/feeds/en.malaysia%23holiday%40group.v.calendar.google.com/public/basic?futureevents=true&alt=json&orderby=starttime&sortorder=ascending";

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

            gcalevent.Date = gcalevent.datetimeStart;
            console.log(gcalevent.Date);
            $("#timeline").trigger("addEvent.timeline", [gcalevent, true]);
        });
    });

});
