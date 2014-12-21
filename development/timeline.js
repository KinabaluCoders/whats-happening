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

var _cell_counter = 0;
var _event_counter = 0;

function new_cell(event)
{
    $cell = $('<div class="cell col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-6 col-md-3" style="border:1px dotted black">');
    $cell.attr("id", "-cell-" + _event_counter++);
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

var layout_configurations = [
    { 
        "cols": 2,
        "css": {
            "min-width": 768
        },
        "bootstrap": {
            "size": "sm",
            "column-multiplier": 6
        }
    },
    { 
        "cols": 4,
        "css": {
            "min-width": 992
        },
        "bootstrap": {
            "size": "md",
            "column-multiplier": 3
        }
    }
];

// track which bootstrap classes are applied to the element

function arrange_events($row)
{
    var $cells = $row.find(".cell");

    var css_text = [];
    var autogenerated_block = $("head").find("style#timeline-autogenerated-css");
    if(autogenerated_block.length <= 0)
    {
        autogenerated_block = $('<style id="timeline-autogenerated-css"></style>');
        $("head").append(autogenerated_block);
    }
    autogenerated_block.empty();

    for(var i=0; i < layout_configurations.length; i++)
    {
        var max_row_height = 0;

        layout_config = layout_configurations[i];
        console.log("configuring for columns:", layout_config);

        // build a media-query rule

        var _media_query = [];
        if(layout_config.css["min-width"])
        {
            _media_query.push("min-width: " + layout_config.css["min-width"] + "px");
        }
        if(layout_config.css["max-width"])
        {
            _media_query.push("max-width: " + layout_config.css["max-width"] + "px");
        }
        css_text.push("@media (" + _media_query.join(") and (") + ")");
        css_text.push("{"); 

        // initialise stacks
        var height_stacks = [];

        // iterate through each cell/event (should be chronological)
        for(var j=0; j < $cells.length; j++)
        {
            var $cell = $($cells[j]);
            var cell_id = $cell.attr("id");
            var cell_height = $cell.outerHeight();

            // iterate through each height stack and find the "lowest" height
            var candidate_stack = -1;
            var minimum_height = -1;
            for(var k=0; k < layout_config.cols; k++)
            {
                if(typeof height_stacks[k] == "undefined")
                {
                    height_stacks[k] = 0;
                }

                if(height_stacks[k] < minimum_height || minimum_height == -1)
                {
                    // found the lowest stack (or this is first iteration)
                    minimum_height = height_stacks[k];
                    candidate_stack = k;
                }
            }

            // a stack has been identified
            var cell_top = height_stacks[candidate_stack];
            var cell_column_enumeration = candidate_stack;

            // virtually add the cell to the height stack
            height_stacks[candidate_stack] += cell_height;

            // track the "tallest" column
            if(max_row_height < height_stacks[candidate_stack])
            {
                max_row_height = height_stacks[candidate_stack];
            }

            // apply absolute styles into the page header

            css_text.push("#" + cell_id);
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
        var segment = $row.attr("data-segment");
        css_text.push('.row.segment[data-segment="' + segment + '"]');
        css_text.push("{");
        css_text.push("    height: " + max_row_height + "px");
        css_text.push("}");
        console.log(layout_config.bootstrap["size"], max_row_height);

        css_text.push("}");
        autogenerated_block.html(css_text.join("\n"));
    }
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

$(window).resize(
    debounce(function(){
        console.log("arranging...");
        arrange_events($("#timeline .row.segment"));
    }, 100)
);

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

$(window).resize();

});