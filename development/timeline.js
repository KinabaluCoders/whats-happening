jQuery(document).ready(function($){

var $timeline = $('#timeline');

function add_event(event)
{
    update_row(event);
}

function determine_row(event)
{
    var $row = $timeline.find('.row[data-segment="' + event.segment + '"]');
    if($row.length <= 0)
    {
        $row = $('<div class="row" data-segment="' + event.segment + '"></div>');

        $timeline.append($row);
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

$("#add-event").click(function(e){
    var event_date = debugGenerate_randomDate(new Date(2014, 11, 01), new Date(2015, 06, 01));
    var event_segment = event_date.getFullYear() + "-" + event_date.getMonth();
    var event =
    {
        Date: event_date,
        segment: event_segment,
        title: debugGenerate_loremIpsum(20, 3)
    };
    add_event(event);
});

});