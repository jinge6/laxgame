var moveablesSize = 50;
var moves = new Array();
var currentMove = 0;
var gameState = "FACE_OFF"; // START, FACE_OFF, PLAY, WAITING, CAN_SHOOT, SHOOT, SAVE, WON, DONE
var team;

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
                x = getCoordinate(1);
            if (j % 7 == 3)
                x = getCoordinate(2);
            if (j % 7 == 4)
                x = getCoordinate(3);
            if (j % 7 == 5)
                x = getCoordinate(4);
            if (j % 7 == 6)
                x = getCoordinate(5);
            if (j % 7 == 7)
                x = getCoordinate(6);

            y = getCoordinate(i);
            $('.fieldContainer').append("<div class='rowCol' id='" + i + '_' + j +"'></div>");
        }
    }
}

function nextMove()
{
    return currentMove + 1;
}

function previousMove()
{
    return currentMove==0?0:currentMove - 1;
}

function initialiseMoveables()
{
    addMoveable(0, "a1", 3, 3);
    addMoveable(0, "d1_2", 2, 3);
    addMoveable(0, "ball", 8, 4);
    addMoveable(0, "fo", 8, 0);
    addMoveable(0, "fo_2", 7, 7);
}

function addMoveable(move, id, row, col)
{
    var moveableID = getMoveableID(row, col);

    var y = getCoordinate(row);
    var x = getCoordinate(col);
    var $img = $('#' + id + '_master').clone();
    $img.attr('id', id);
    $img.show();
    if (id.indexOf('ball') >= 0)
    {
        $img.css({left: x, top: y}).attr('class', 'ball moveable');
    }
    else
    {
        $img.css({left: x, top: y}).attr('class', 'player moveable');
    }
    $(moveableID).append($img);
    saveMove(move, id, row, col);

    var $players = $(".player");
    $players.draggable({containment: '.fieldContainer', revert: "invalid"});
}

function saveMove(move, id, row, col)
{
    var found = false;

    for (var i=0; i<moves.length; i++)
    {
        if (moves[i][0] == move && moves[i][1] == id)
        {
            moves[i][2] = row;
            moves[i][3] = col;
            found = true;
            break;
        }
    }
    if (found == false)
    {
        moves.push([move,id, row, col]);
        addFadedStartingImage(id, row, col);
    }
}

function addFadedStartingImage(id)
{
    var row = getMovesOriginalRowOrColumn(id, "row");
    var col = getMovesOriginalRowOrColumn(id, "col");
    var moveableID = getMoveableID(row, col);
    var y = getCoordinate(row);
    var x = getCoordinate(col);
    var $img = $('#' + id + '_master').clone();
    $img.show();
    $img.css({left: x, top: y, opacity: 0.1}).attr('class', 'playerStartingPoint');
    $(moveableID).append($img);
}

function getMoveableID(row, col)
{
    return '#'+ row + '_' +  col;
}

function getCoordinate(rowOrCol)
{
    return rowOrCol * moveablesSize
}

function getCountDownDate(millisecs) {
    selectedDate = new Date().valueOf() + millisecs;
    return selectedDate.toString()
}

function gameLoop()
{
    switch (gameState)
    {
        case "START":
            break;
        case "FACE_OFF":
            runFaceoff();
            break;
        case "PLAY":
            runPlay();
            break;
        case "WAITING":
            break;
        case "CAN_SHOOT":
            break;
        case "SHOOT":
            break;
        case "GOALIE_SAVE":
            break;
        case "WON":
            break;
        case "FINISHED":
            break;
    }
}

function runFaceoff()
{
    $('#clock').countdown(getCountDownDate(5000))
        .on('update.countdown', function(event) {
            var format = '%S';
            $(this).html(event.strftime(format));
        })
        .on('finish.countdown', function(event) {
            if (gameState == "FACE_OFF")
            {
                $(this).html('Draw');
                flickBallOut();
                $(document).on('mousemove', function (e) {
                    var containerOffset = $(".fieldContainer").offset();

                    $('#fo').css({
                        left: e.pageX - containerOffset.left - moveablesSize,
                        top: e.pageY - containerOffset.top
                    });
                    $('#fo_2').css({
                        left: e.pageX - containerOffset.left,
                        top: e.pageY - containerOffset.top
                    });
                });
                $('#ball').click(function () {
                    $('#clock').html('AJAX Feedback here');
                    $(document).off('mousemove');
                    gameState = "PLAY";
                    $('.moveOption').remove();
                    // TODO set the left an top properly
                    setContainment("fo");
                    gameLoop();
                });
            }
        });
}

function runPlay()
{
    currentMove++;
    $('#clock').countdown(getCountDownDate(10000))
        .on('update.countdown', function(event) {
            var format = '%S';
            $(this).html(event.strftime(format));
        })
        .on('finish.countdown', function(event) {
            if (gameState == "FACE_OFF")
            {
                $(this).html('AJAX Feedback here');
            }
        });
}

function flickBallOut()
{
    // reset containment
    $(".player").draggable({containment: 'fieldContainer', revert: "invalid"});
    $dropContainer = $(".fieldContainer");

    var row = 8;
    var col = 4;

    while (row == 8 && col == 4)
    {
        row = 7 + Math.floor(Math.random() * 3);
        col = 2 + Math.floor(Math.random() * 6);
    }

    $('#ball').css('left', getCoordinate(col) + "px");
    $('#ball').css('top', getCoordinate(row) + "px");
}

function getMovesOriginalCoord(id, xOrY)
{
    var coord = 0;

    for (var i=0; i<moves.length; i++)
    {
        if (moves[i][0] == previousMove() && moves[i][1] == id)
        {
            if (xOrY == "x")
            {
                coord = getCoordinate(moves[i][2]);
            }
            else
            {
                coord = getCoordinate(moves[i][3]);
            }
            break;
        }
    }
    return coord;
}

function getMovesOriginalRowOrColumn(id, rowOrColumn)
{

    var rowOrCol = 0;

    for (var i=0; i<moves.length; i++)
    {
        if (moves[i][0] == previousMove() && moves[i][1] == id)
        {
            if (rowOrColumn == "row")
            {
                rowOrCol = moves[i][2];
            }
            else
            {
                rowOrCol = moves[i][3];
            }
            break;
        }
    }
    return rowOrCol;
}

function getContainmentCoords(id)
{
    var row = getMovesOriginalRowOrColumn(id, "row");
    var col = getMovesOriginalRowOrColumn(id, "col");

    var containerOffset = $(".fieldContainer").offset();
    var containerOffsetXPos = containerOffset.top;
    var containerOffsetYPos = containerOffset.left;
    var startRow = row - 2;
    var stopRow = row + 2;
    var startCol = col - 2;
    var stopCol = col + 2;

    if ( row <= 1)
    {
        startRow = 0;
    }
    if (row >= 15)
    {
        stopRow = 15;
    }
    if (col <= 1)
    {
        startCol = 0;
    }
    if (col >= 7)
    {
        stopCol = 7;
    }

    var x1 = getCoordinate(startCol) + containerOffsetYPos;
    var y1 = getCoordinate(startRow) + containerOffsetXPos;
    var x2 = getCoordinate(stopCol) + containerOffsetYPos;
    var y2 = getCoordinate(stopRow) + containerOffsetXPos;

    return [x1, y1, x2 ,y2]
}

function setContainment(id)
{
    addVisualMoveOptions(id);
    addContainmentToMoveable(id);
}

function addContainmentToMoveable(id)
{
    var containmentCoords = getContainmentCoords(id);

    $("#" + id).draggable("option", "containment", containmentCoords);
    $("#" + id).data('uiDraggable')._setContainment();
}

function addVisualMoveOptions(id)
{
    var row = getMovesOriginalRowOrColumn(id, "row");
    var col = getMovesOriginalRowOrColumn(id, "col");

    var moveableID = getMoveableID(row, col);
    var startRow = row - 2;
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
            var $moveOption = $('#moveToSpot').clone();
            $moveOption.css({left: getCoordinate(j), top: getCoordinate(i), opacity: 1}).attr('class', 'moveOption');
            $(moveableID).append($moveOption);
        }
    }
    $(moveableID).width((stopCol-startCol+1)*50);
    $(moveableID).height((stopRow-startRow+1)*50);
}