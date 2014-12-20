jQuery(document).ready(function($){

var $timeline = $('#timeline');

function add_event(event)
{
    update_row(event);
    update_segment_dividers();
}

function determine_row(event)
{
    // seek existing segment
    var $row = $timeline.find('.row.segment[data-segment="' + event.segment + '"]');

    if($row.length <= 0)
    {
        // create and insert new segment - latest segment first

        $rows = $timeline.find('.row.segment[data-segment]'); // the [attr] skips .reference rows

        $row = $('<div class="row segment" data-segment="' + event.segment + '"></div>');

        var _insertBefore = false;
        for(var i=0; i < $rows.length; i++)
        {
            var current_row = $rows[i];
            var next_segment = $(current_row).attr("data-segment");
            if(event.segment > next_segment)
            {
                _insertBefore = current_row;
                break;
            }
        }

        if(_insertBefore === false)
        {
            $row.appendTo($timeline);
        }
        else
        {
            $row.insertBefore(_insertBefore);
        }
    }

    return $row;
}

function update_row(event)
{
    var $row = determine_row(event);

    var $cell = new_cell(event);

    var _insert = false;
    var $cells = $row.find(".cell");
    for(var i=0; i < $cells.length; i++)
    {
        var current_cell = $cells[i];
        if(event.Date > $(current_cell).data("event").Date)
        {
            $cell.insertBefore(current_cell);
            _insert = true;
            break;
        }
    }
    if(!_insert)
    {
        $cell.appendTo($row);
    }

    return true;
}

function update_segment_dividers()
{
    var $prev_segment = false;
    var Segments = $timeline.find(".segment");
    for(var i=0; i < Segments.length; i++)
    {
        var $segment = $(Segments[i]);
        var $next_segment = false;

        if(i < (Segments.length - 1))
        {
            $next_segment = $(Segments[i+1]);
        }
        else
        {
            $next_segment = false;
        }

        var _boundary = {
            "signature" : "unknown",
            "title" : "unknown"
        };

        if($prev_segment == false)
        {
            _boundary.title = "START";
            _boundary.signature = "start";

            $timeline.prepend(the_boundary(_boundary));
        }

        if($next_segment == false)
        {
            _boundary.title = "END";
            _boundary.signature = "end";

            $timeline.append(the_boundary(_boundary));
        }
        else
        {
            _boundary.title = "AFTER " + $segment.attr("data-segment");
            _boundary.signature = "after-" + $segment.attr("data-segment");

            the_boundary(_boundary).insertBefore($next_segment);
        }

        $prev_segment = $segment;
    }
}

function the_boundary(_boundary)
{
    var $boundary = false;

    var existing = $timeline.find('.boundary[data-signature="' + _boundary.signature + '"]');
    if(existing.length <= 0)
    {
        $boundary = $('<div class="row boundary" style="background:#eaeaea;"><div class="col-md-12">' + _boundary.title + '</div></div>')
        $boundary.attr("data-signature", _boundary.signature);
    }
    else
    {
        $boundary = $(existing.get(0));
    }

    return $boundary;
}

var _event_counter = 0;

function new_cell(event)
{
    $cell = $('<div class="cell col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-6 col-md-3" style="border:1px dotted black">');
    $cell.data("event", event);

    $event = $('<div class="event"></div>')
    $event.attr("id", "-event-" + _event_counter++);
    $event.append($('<div class="arrow-line visible-md-block visible-lg-block"></div>'));
    $event.append($('<div class="timeline-icon"><span class="glyphicon glyphicon-star-empty"></span></div>'));
    $event.append($('<b style="font-size:2.0em; float:left; margin-right:3px;">' /*+ event.Date.getMonth() + "/" */+ event.Date.getDate() + "</b>"));
    $event.append(event.title + ' (' + event.Date.toString() + ', ' + event.segment + ')');

    $cell.append($event);

    return $cell;
}

function segment_from_event(event)
{
    var theDate = event.Date;
    return (theDate.getFullYear() * 100) + theDate.getMonth(); // XXX: produces YYYYMM as integer
}

function debug_add_random_event()
{
    var event_date = debugGenerate_randomDate(new Date(2015, 0, 1), new Date(2015, 0, 31));
    var event =
    {
        Date: event_date,
        segment: false,
        title: debugGenerate_loremIpsum(20, 3)
    };
    event.segment = segment_from_event(event);
    add_event(event);
}

$("#add-event").click(function(e){
    debug_add_random_event();
});

debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();
debug_add_random_event();

});