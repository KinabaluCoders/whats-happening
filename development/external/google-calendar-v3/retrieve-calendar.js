jQuery(document).ready(function($){

    function parse_google_calendar_v3(source_url)
    {
        jQuery.getJSON(source_url, function(data)
        {
            $.each(data.items, function(i, item)
            {
                console.log(item);
            });
        });
    }

    var v3_url = "https://www.googleapis.com/calendar/v3/calendars/tuhau.net_j88fansm5gtuopgeqvccbdmid4@group.calendar.google.com/events?key=AIzaSyC0oOhKWBJR9vr3kUQUHZimiaksk8eWj4k";

    parse_google_calendar_v3(v3_url);

});
