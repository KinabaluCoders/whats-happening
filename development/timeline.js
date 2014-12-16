jQuery(document).ready(function($){

var $timeline = $('#timeline');

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

function update_row(event)
{
    var $row = determine_row(event);

    $columns = $row.find(".column"); // max: 2 .column per .row
    $subcolumns = $row.find(".subcolumn"); // max: 4 .subcolumn per .row, 2 .subcolumn / .column
    $events = $row.find(".event"); // unlimited, added into subcolumn[++]: 0 1 2 3 0
    subcolumn_no = $events.length % 4;
    column_no = $events.length % 2;

    if(!$columns[column_no])
    {
        // create column if not found
        var $column = new_column();
        $columns.push($column)
        $row.append($column);
    }

    if(!$subcolumns[subcolumn_no])
    {
        // create subcolumn if not found
        var $subcolumn = new_subcolumn();
        $subcolumns.push($subcolumn);
        $($columns[column_no]).append($subcolumn);
    }

    $($subcolumns[subcolumn_no]).append(new_event(event)); 
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
    $event = $('<div class="event col-xs-12 col-sm-12 col-md-12"></div>').hide();
    $event.append($('<div class="arrow-line visible-md-block visible-lg-block"></div>'));
    $event.append($('<div class="timeline-icon"><span class="glyphicon glyphicon-star-empty"></span></div>'));
    $event.append($('<b style="font-size:2.0em; float:left; margin-right:3px;">' + event.Date.getMonth() + "/" + event.Date.getDate() + "</b>"));
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
    var event_date = debugGenerate_randomDate(new Date(2014, 11, 01), new Date(2015, 06, 01));
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