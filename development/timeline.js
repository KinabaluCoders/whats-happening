jQuery(document).ready(function($){

var $timeline = $('#timeline');

var insertion_sequence = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1]
];

function add_event(event)
{
    update_row(event);
}

function determine_row(event)
{
    // seek existing segment
    var $row = $timeline.find('.row[data-segment="' + event.segment + '"]');

    if($row.length <= 0)
    {
        // create and insert new segment - latest segment first

        $rows = $timeline.find('.row[data-segment]'); // the [attr] skips .reference rows

        $row = $('<div class="row" data-segment="' + event.segment + '"></div>');

        _insertBefore = false;
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

function attach_event($row, $event, position, type)
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

    if(!type || type == 'append')
    {
        console.log("appending", position , "to column", column_no, "subcolumn", subcolumn_no, $event);
        $current_subcolumn.append($event);
    }
    else if(type == 'prepend')
    {
        console.log("prepending", position , "to column", column_no, "subcolumn", subcolumn_no, $event);
        $current_subcolumn.prepend($event);
    }
    else
    {
        throw new Error("what is that?"); // XXX: better error
    }
}

function list_events($row)
{
    var events = [ 
        $row.find(".column:nth-child(1) .subcolumn:nth-child(1) .event"), 
        $row.find(".column:nth-child(2) .subcolumn:nth-child(1) .event"), 
        $row.find(".column:nth-child(1) .subcolumn:nth-child(2) .event"), 
        $row.find(".column:nth-child(2) .subcolumn:nth-child(2) .event")
    ];

    var total_events = events[0].length + events[1].length + events[2].length + events[3].length;
    var chronology = [];
    var counters = [0, 0, 0, 0];

    for(var i=0; i < total_events; i++)
    {
        var column_no = i % 4;
        chronology.push(events[column_no][counters[column_no]]);
        counters[column_no]++;
    }

    return chronology;
}

function update_row(event)
{
    var $row = determine_row(event);

    var $event = new_event(event);

    var position = -1; // default: append event
    var type = 'append';

    var $events = list_events($row);
    for(var i=0; i < $events.length; i++)
    {
        var current_event = $events[i];
        if(event.Date > $(current_event).data("event").Date)
        {
            console.log("inserting new event at position", i, $event)
            position = i;
            type = 'append';
            attach_event($row, $event, position, type);
            for(j=i; j < $events.length; j++)
            {
                var shifted_position = j+1;
                var shifted_event = $events[j];
                console.log("shifting forward to position", shifted_position, shifted_event);
                attach_event($row, $(shifted_event), shifted_position, 'append');
            }
            return; //XXX: refactor!
        }
    }

    attach_event($row, $event, position, type);
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

function new_event(event)
{
    $event = $('<div class="event col-xs-12 col-sm-12 col-md-12"></div>').data("event", event).hide();
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
    var event_date = debugGenerate_randomDate(new Date(2015, 0, 1), new Date(2015, 0, 20));
    var event =
    {
        Date: event_date,
        segment: false,
        title: debugGenerate_loremIpsum(20, 3)
    };
    event.segment = segment_from_event(event);
    add_event(event);
});

$("#list-events").click(function(e){
    console.log(list_events($('#timeline .row:not(.reference)')))
});

});