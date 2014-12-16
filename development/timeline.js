jQuery(document).ready(function($){

var $timeline = $('#timeline');

function add_event(event)
{
    update_row(event);
}

function update_row(event)
{
    $row = $timeline.find('.row[data-day="' + event.segment + '"]');
    if($row.length <= 0)
    {
        $row = $('<div class="row" data-day="' + event.segment + '"></div>');

        $timeline.append($row);
    }

    $columns = $row.find(".column"); // max: 2 .column per .row
    $subcolumns = $row.find(".subcolumn"); // max: 4 .subcolumn per .row, 2 .subcolumn / .column
    $events = $row.find(".event"); // unlimited, added into subcolumn[++]: 0 1 2 3 0
    subcolumn_no = $events.length % 4;
    column_no = $events.length % 2;

    console.log(column_no, subcolumn_no);

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
    $event = $('<div class="event col-xs-12 col-sm-12 col-md-12">' + event.title + ' (' + event.Date.toString() + ')</div>');
    return $event;
}

$("#add-event").click(function(e){
    var event =
    {
        Date: debugGenerate_randomDate(new Date(2014, 11, 01), new Date(2015, 06, 01)),
        segment: debugGenerate_randomInteger(1, 3),
        title: debugGenerate_loremIpsum(30, 10)
    };
    add_event(event);
});

});