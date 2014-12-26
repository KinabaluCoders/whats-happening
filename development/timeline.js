jQuery(document).ready(function($){

var $timeline = $('#timeline');

function _determine_row(event)
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

function add_event(event, animate)
{
    update_row(event, animate);
    update_segment_dividers();
}

function update_row(event, animate)
{
    var $row = _determine_row(event);

    var $cell = new_cell(event, animate);

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

            the_boundary(_boundary)
                .prependTo($timeline)
                .trigger("updated.timelineBoundary");
        }

        if($next_segment == false)
        {
            _boundary.title = "END";
            _boundary.signature = "end";

            the_boundary(_boundary)
                .appendTo($timeline)
                .trigger("updated.timelineBoundary");
        }
        else
        {
            _boundary.title = "AFTER " + $segment.attr("data-segment");
            _boundary.signature = "after-" + $segment.attr("data-segment");

            the_boundary(_boundary)
                .insertBefore($next_segment)
                .trigger("updated.timelineBoundary");
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
        $boundary = $('<div class="row boundary"><div class="col-md-12">' + _boundary.title + '</div></div>')
        $boundary.attr("data-signature", _boundary.signature);
    }
    else
    {
        $boundary = $(existing.get(0));
    }

    return $boundary;
}

var _cell_counter = 0;
var _event_counter = 0;

function new_cell(event, animate)
{
    $cell = $('<div class="cell col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-6 col-md-3">');
    $cell.attr("id", "-cell-" + _event_counter++);
    $cell.data("event", event);

    $event = $('<div class="event"></div>')
    $event.attr("id", "-event-" + _event_counter++);
    $event.append($('<div class="arrow-line visible-md-block visible-lg-block"></div>'));
    $event.append($('<div class="timeline-icon">' + event.Date.getDate() + '</div>'));

    if(animate)
    {
        $event.addClass("-animate-newly-added");
    }

    $content = $('<div class="content"></div>');

    // $content.append($('<b style="font-size:2.0em; float:left; margin-right:3px;">' /*+ event.Date.getMonth() + "/" */+ event.Date.getDate() + "</b>"));
    $content.append(event.title + ' ');
    // $content.append(event.Date.toString() + ', ' + event.segment + ')');

    $event.append($content);
    $cell.append($event);

    return $cell;
}

var layout_configurations = [
    { 
        "cols": 2,
        "waterlineOffset": 50,
        "css": {
            "min-width": 768,
            "max-width": 991
        },
        "bootstrap": {
            "size": "sm",
            "column-multiplier": 6
        }
    },
    { 
        "cols": 4,
        "waterlineOffset": 50,
        "stackOffsets": [100, 0 ,25 ,50], 
            // DEV: far-left column will be skipped when evaluated for first time
        "css": {
            "min-width": 992
        },
        "bootstrap": {
            "size": "md",
            "column-multiplier": 3
        }
    }
];


function arrange_events($row)
{
    $row.trigger("refresh.timelineLayout");

    var segment = $row.attr("data-segment");

    var $cells = $row.find(".cell");

    var css_text = [];
    var autogenerated_block = $("head").find("style#timeline-autogenerated-css-" + segment);
    if(autogenerated_block.length <= 0)
    {
        autogenerated_block = $('<style id="timeline-autogenerated-css-' + segment + '"></style>');
        $("head").append(autogenerated_block);
    }
    autogenerated_block.empty();

    // http://stackoverflow.com/a/8876069
    var clientWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    for(var i=0; i < layout_configurations.length; i++)
    {
        var max_row_height = 0;

        layout_config = layout_configurations[i];

        /*
            layout_config.css.min-width
            layout_config.css.max-width

                builds media-query rules
                XXX: @media block is redundant
                only matching size classes will be generated based on min-width, max-width
        */
        var _media_query = [];
        if(layout_config.css["min-width"])
        {
            _media_query.push("min-width: " + layout_config.css["min-width"] + "px");

            if(clientWidth <= layout_config.css["min-width"])
            {
                console.log("bootstrap class not rendered:", layout_config.bootstrap["size"], ", < min-width of", layout_config.css["min-width"]);
                continue;
            }
        }
        if(layout_config.css["max-width"])
        {
            _media_query.push("max-width: " + layout_config.css["max-width"] + "px");

            if(clientWidth >= layout_config.css["max-width"])
            {
                console.log("bootstrap class not rendered:", layout_config.bootstrap["size"], ", > max-width of", layout_config.css["max-width"]);
                continue;
            }
        }
        css_text.push("@media (" + _media_query.join(") and (") + ")");
        css_text.push("{"); 

        console.log("configuring:", layout_config);

        /*
        layout_config.cols 
            integer
                implied array(<integer>) containing elements 0 to N-1
                standard left to right evaluation of each column height
            array of integers 
                e.g. [1, 0, 3, 2]
                explicit evaluation sequence of column heights
        */
        var actual_sequence = [];
        var sequence_length = layout_config.cols;
        if(typeof sequence_length == "object")
        {
            actual_sequence = sequence_length;
            sequence_length = sequence_length.length;
        }
        else if(typeof sequence_length == "number")
        {
            for(var j=0; j < sequence_length; j++)
            {
                actual_sequence[j] = j;
            }
        }
        console.log("stack sequence:", actual_sequence, "sequence length:", sequence_length);

        // initialise stacks
        var height_stacks = [];
        var waterline_height = 0;

        // iterate through each cell/event (should be chronological order in DOM)
        for(var j=0; j < $cells.length; j++)
        {
            var $cell = $($cells[j]);
            var cell_id = $cell.attr("id");
            var cell_height = $cell.outerHeight();

            // iterate through each height stack and find the "shortest" height
            var candidate_stack = -1;
            var minimum_height = -1;
            for(var _s=0; _s < sequence_length; _s++)
            {
                var k = actual_sequence[_s];

                // initialise specific stack if it doesn't exist yet
                if(typeof height_stacks[k] == "undefined")
                {
                    var initial_height = 0;

                    /* 
                    layout_config.stackOffsets 
                        array of integers
                            e.g. [0, 20, 40, 60]
                            add height offsets when initialising the stacks
                    */
                    if(layout_config.stackOffsets)
                        if(layout_config.stackOffsets[k])
                            initial_height = layout_config.stackOffsets[k];

                    height_stacks[k] = initial_height;
                }

                if(height_stacks[k] < minimum_height || minimum_height == -1)
                {
                    // found the shortest stack (or this is first iteration)
                    minimum_height = height_stacks[k];
                    candidate_stack = k;
                }
            }

            // the shortest stack has been identified
            var cell_top = height_stacks[candidate_stack];
            var cell_column_enumeration = candidate_stack;

            if(layout_config.waterlineOffset)
            {
                /*
                layout_config.waterlineOffset
                    prevents event icons/markers from overlapping on multi-column 
                        time-lines by overriding the calculated height
                */
                if(waterline_height > cell_top)
                {
                    var diff = waterline_height - cell_top; 
                    cell_top = waterline_height;
                    height_stacks[candidate_stack] = waterline_height;
                }
                waterline_height = cell_top + layout_config.waterlineOffset;
            }

            // virtually add the cell to the height stack
            height_stacks[candidate_stack] += cell_height;

            // track the "tallest" column
            if(max_row_height < height_stacks[candidate_stack])
            {
                max_row_height = height_stacks[candidate_stack];
            }

            // apply absolute styles into the page header

            css_text.push("    #" + cell_id);
            css_text.push("    {");
            css_text.push("        position: absolute;");
            css_text.push("        top: " + cell_top + "px;");
            css_text.push("    }");

            // remove previous offsets for this size class
            var _candidate_classes = [];
            for(var k=0; k < 12; k+= layout_config.bootstrap["column-multiplier"])
            {
                _candidate_classes.push("col-" + layout_config.bootstrap["size"] + "-offset-" + k);
            }
            $cell.removeClass(_candidate_classes.join(" "));

            // apply offset classes to simulate columns

            bootstrap_offset_class = "col-" + layout_config.bootstrap["size"] + "-offset-" + (layout_config.bootstrap["column-multiplier"] * cell_column_enumeration);
            $cell.addClass(bootstrap_offset_class);
        }

        // set row height
        css_text.push('    .row.segment[data-segment="' + segment + '"]');
        css_text.push("    {");
        css_text.push("        height: " + max_row_height + "px");
        css_text.push("    }");

        css_text.push("}");
        autogenerated_block.html(css_text.join("\n"));
    }

    $row.trigger("refreshed.timelineLayout");
}

function segment_from_event(event)
{
    var theDate = event.Date;
    return (theDate.getFullYear() * 100) + theDate.getMonth(); // XXX: produces YYYYMM as integer
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
// source: http://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate)
{
    var timeout;
    return function()
    {
        var context = this, args = arguments;
        var later = function()
        {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow)
        {
            func.apply(context, args);
        };
    };
};

var ratelimited_arrange = debounce(function(){
    $("#timeline .row.segment").each(function(i, segment){
        arrange_events($(segment));
    });
}, 100);


$(window).resize(ratelimited_arrange);

function group_markers($row, Groups)
{
    var $events = $row.find(".event");

    var events_length = $events.length;
    var groups_length = Groups.length;
    var current_group = -1;
    var group_id = "";

    var $prev_marker = false;
    for(var i=0; i < events_length; i++)
    {
        var $event = $($events[i]);
        var $marker = $event.find(".timeline-icon");

        var group_has_changed = false;

        $marker.removeClass("first-in-group last-in-group");

        if($prev_marker == false || $prev_marker.text() != $marker.text())
        {
            current_group++;
            if(groups_length > 1)
            {
                if(current_group > (groups_length - 1))
                {
                    // wraparound for supplied Groups
                    current_group = 0;
                }
                group_id = Groups[current_group];
            }
            else
            {
                group_id = current_group;
            }

            if($prev_marker)
            {
                $prev_marker.addClass("last-in-group");
            }

            $marker.addClass("first-in-group");
        }

        if(i == (events_length - 1))
        {
            // at last event for entire segment
            if($marker)
            {
                $marker.addClass("last-in-group");
            }
        }

        $event.attr("data-group", group_id);
        $event.attr("data-icounter", i);

        $prev_marker = $marker;
    }
}

$("#timeline")
    .on("refresh.timelineLayout", ".row.segment", function(e){
        var $row = $(this);

        $row.removeClass("-layout-finalised");
    })
    .on("refreshed.timelineLayout", ".row.segment", function(e){
        var $row = $(this);

        $row.addClass("-layout-finalised");

        $row.find(".-animate-newly-added").removeClass("-animate-newly-added");

        group_markers($row, ["color1", "color2", "color3", "color4"]);
    })
    .on("updated.timelineBoundary", ".row.boundary", function(e){
        var $row = $(this);

        $row.css("background-color", "red");
    });


function debug_add_random_event(animate)
{
    var event_date = debugGenerate_randomDate(new Date(2015, 0, 1), new Date(2015, 0, 31));
    var event =
    {
        Date: event_date,
        segment: false,
        title: debugGenerate_loremIpsum(100, 3)
    };
    event.segment = segment_from_event(event);
    add_event(event, animate);
    ratelimited_arrange();
}

$("#add-event").click(function(e){
    debug_add_random_event(true);
});

if(true)
{
    for(var i=0; i < 10; i++)
    {
        debug_add_random_event();
    }
}

$(window).resize();

});