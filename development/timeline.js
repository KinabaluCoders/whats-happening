jQuery(document).ready(function($){

var $timeline = $('#timeline');

// sets column-subcolumn distribution of events
//  most apparently for 4-col timelines
var insertion_sequence = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
];

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

function attach_event($row, $event, position)
{
    if(position == -1)
    {
        $events = $row.find(".event");
        position = $events.length;
    }

    var current_sequence = insertion_sequence[position % 4];
    column_no = current_sequence[0];
    subcolumn_no = current_sequence[1];

    var $columns = $row.find(".column"); // max: 2 .column per .row
    if(!$columns[column_no])
    {
        // create column if not found
        var $column = new_column();
        $columns.push($column)
        $row.append($column);
    }
    var $current_column = $($columns[column_no]);

    var $subcolumns = $current_column.find(".subcolumn"); // 2 .subcolumn / .column (4 .subcolumn per .row)
    if(!$subcolumns[subcolumn_no])
    {
        // create subcolumn if not found
        var $subcolumn = new_subcolumn();
        $subcolumns.push($subcolumn);
        $current_column.append($subcolumn);
    }
    var $current_subcolumn = $($subcolumns[subcolumn_no]);
    $current_subcolumn.append($event);
}

function list_events($row)
{
    var events_count = 0;
    var subcolumn_events = [];
    var subcolumn_counters = [];
    var ordered_events = [];

    for(var i=0; i < insertion_sequence.length; i++)
    {
        var column_nchild = insertion_sequence[i][0] + 1;
        var subcolumn_nchild = insertion_sequence[i][1] + 1;
        subcolumn_events[i] = $row.find(".column:nth-child(" + column_nchild + ") .subcolumn:nth-child(" + subcolumn_nchild + ") .event");
        events_count += subcolumn_events[i].length;

        subcolumn_counters[i] = 0;
    }

    for(var i=0; i < events_count; i++)
    {
        var current_sequence = i % 4;
        var subcolumn_child = subcolumn_counters[current_sequence];

        ordered_events.push(subcolumn_events[current_sequence][subcolumn_child]);

        subcolumn_counters[current_sequence]++;
    }

    return ordered_events;
}

function update_row(event)
{
    var $row = determine_row(event);

    var $event = new_event(event);

    var _insert = false;
    var $events = list_events($row);
    for(var i=0; i < $events.length; i++)
    {
        var current_event = $events[i];
        if(event.Date > $(current_event).data("event").Date)
        {
            // insert immediately, then shift all proceeding events by 1

            // console.log("inserting new event at position", i, $event)
            attach_event($row, $event, i);

            for(j=i; j < $events.length; j++)
            {
                var shifted_position = j+1;
                var shifted_event = $events[j];

                // console.log("shifting forward to position", shifted_position, shifted_event);
                attach_event($row, $(shifted_event), shifted_position);
            }

            _insert = true;
            break;
        }
    }

    if(!_insert)
    {
        // DEV: adding older items are slowest, as it must scan the entire event list
        attach_event($row, $event, -1);
    }
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

function new_column()
{
    // columns contain sub-columns
    $column = $('<div class="column col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-6 col-md-6"></div>');
    return $column;
}

function new_subcolumn()
{
    // subcolumns contain stackable events
    $subcolumn = $('<div class="subcolumn col-xs-12 col-sm-12 col-md-6"></div>');
    return $subcolumn;
}

var _event_counter = 0;

function new_event(event)
{
    $event = $('<div class="event col-xs-12 col-sm-12 col-md-12"></div>').data("event", event).hide();
    $event.attr("id", "-event-" + _event_counter++);
    $event.append($('<div class="arrow-line visible-md-block visible-lg-block"></div>'));
    $event.append($('<div class="timeline-icon"><span class="glyphicon glyphicon-star-empty"></span></div>'));
    $event.append($('<b style="font-size:2.0em; float:left; margin-right:3px;">' /*+ event.Date.getMonth() + "/" */+ event.Date.getDate() + "</b>"));
    $event.append(event.title + ' (' + event.Date.toString() + ', ' + event.segment + ')');
    $event.fadeIn("fast");
    return $event;
}

function segment_from_event(event)
{
    var theDate = event.Date;
    return (theDate.getFullYear() * 100) + theDate.getMonth(); // XXX: produces YYYYMM as integer
}

$("#add-event").click(function(e){
    var event_date = debugGenerate_randomDate(new Date(2015, 0, 1), new Date(2015, 0, 31));
    var event =
    {
        Date: event_date,
        segment: false,
        title: debugGenerate_loremIpsum(20, 3)
    };
    event.segment = segment_from_event(event);
    add_event(event);
});

});