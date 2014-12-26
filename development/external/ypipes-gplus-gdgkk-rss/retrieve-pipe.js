jQuery(document).ready(function($){

    function parse_rss_feed(source_url, item_callback)
    {
        $.ajax({
            type: "GET",
            url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=1000&callback=?&q=' + encodeURIComponent(source_url),
            dataType: 'json',
            error: function(){
                console.log("failed");
            },
            success: function(xml){
                values = xml.responseData.feed.entries;
                $.each(values, function(i, item){
                    item_callback(item);
                })
            }
        });
    }

    var callback = function(item){ console.log(item) };

    /* debug: timeline integration */

    var $timeline = $("#timeline");
    if($timeline.length > 0)
    {
        callback = function(feeditem)
        {
            if(!feeditem.title) return true;
            if(!feeditem.content) return true;

            // add event to timeline
            feeditem.classes = ["post"];
            feeditem.Date = new Date(feeditem.publishedDate);
            feeditem._visibleContent = feeditem.content;
            $timeline.trigger("addEvent.timeline", [feeditem, true]);
        };
    }

    /* retrieve and process feed */

    var pipes_url = 'http://pipes.yahoo.com/pipes/pipe.run?_id=fe86a86d950536686b2ad99ed515887f&_render=rss&linkToPost=1&user=%2Bgdgkotakinabalu';

    parse_rss_feed(pipes_url, callback);

});
