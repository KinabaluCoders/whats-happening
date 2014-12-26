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
            if(!feeditem.contentSnippet) return true;

            // add event to timeline
            feeditem.classes = ["post", "roboneo", "facebook"];
            feeditem.Date = new Date(feeditem.publishedDate);
            feeditem._visibleContent = feeditem.contentSnippet;
            $timeline.trigger("addEvent.timeline", [feeditem, true]);
        };
    }

    /* retrieve and process feed */

    var pipes_url = 'https://www.facebook.com/feeds/page.php?format=rss20&id=316548921855567';

    parse_rss_feed(pipes_url, callback);

});
