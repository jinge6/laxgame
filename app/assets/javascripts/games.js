var moveablesSize = 50;

function initialiseRowsAndColumns()
{
    for(var i = 0; i <= 15; i++)
    {
        for (var j = 0; j <= 7; j++)
        {
            var x, y;
            if (j % 7 == 1)
                x = 0;
            if (j % 7 == 2)
                x = moveablesSize;
            if (j % 7 == 3)
                x = 2 * moveablesSize;
            if (j % 7 == 4)
                x = 3 * moveablesSize;
            if (j % 7 == 5)
                x = 4 * moveablesSize;
            if (j % 7 == 6)
                x = 5 * moveablesSize;
            if (j % 7 == 7)
                x = 6 * moveablesSize;

            y = moveablesSize * i;
            $('.fieldContainer').append("<div class='rowCol' id='" + i + '_' + j +"'></div>");
        }
    }
}

function initialiseMoveables()
{
    addMoveable("a1", 3, 3);
    addMoveable("d1_2", 2, 3);
    addMoveable("ball", 8, 4);
}

function addMoveable(id, row, col)
{
    var moveableID = getMoveableID(row, col);
    // add the moveable one
    var y = row * moveablesSize;
    var x = col * moveablesSize;
    var $img = $('#' + id + '_master').clone();
    $img.attr('id', id);
    $img.show();
    $img.css({left: x, top: y}).attr('class', 'player moveable');
    $(moveableID).append($img);

    var $players = $(".player");
    $players.draggable({containment: '.fieldContainer', revert: "invalid"});
}

function getMoveableID(row, col)
{
    return '#'+ row + '_' +  col;
}

function getContainmentCoords(x, y)
{
    var containerOffset = $(".fieldContainer").offset();
    var containerOffsetXPos = containerOffset.left;
    var containerOffsetYPos = containerOffset.top;

    var x1 = (x-100)<0?0:(x-100) + containerOffsetXPos;
    var y1 = (y-100)<0?0:(y-100) + containerOffsetYPos;
    var x2 = (x+100)>400?400:(x+100) + containerOffsetXPos;
    var y2 = (y+100)>800?800:(y+100) + containerOffsetYPos;

    return [x1, y1, x2 ,y2]
}

function addMoveOptions(row, col)
{
    var moveableID = getMoveableID(row, col);
    var startRow = row-2;
    var stopRow = row + 2;
    var startCol = col - 2;
    var stopCol = col + 2;
    if ( startRow < 0)
    {
        startRow = 0;
    }
    if (stopRow > 15)
    {
        stopRow = 15;
    }
    if (startCol < 0)
    {
        startCol = 0;
    }
    if (stopCol > 7)
    {
        stopCol = 7;
    }

    for (var i=startRow; i<=stopRow; i++)
    {
        for (var j=startCol; j<=stopCol; j++)
        {
            if (i==row && j==col)
            {
                continue;
            }
            else
            {
                var $moveOption = $('#moveToSpot').clone();
                $moveOption.css({left: j * moveablesSize, top: i * moveablesSize, opacity: 1}).attr('class', 'moveOption');
                $(moveableID).append($moveOption);
            }
        }
    }
}