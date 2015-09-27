var moves = [];
var currentMove = 0;
var moveablesSize = 50;

function initialiseRowsAndColumns()
{
    for(var i = 0; i <= 7; i++)
    {
        for (var j = 0; j <= 15; j++)
        {
            var x, y;
            if (j % 15 == 1)
                x = 0;
            if (j % 15 == 2)
                x = getCoordinate(1);
            if (j % 15 == 3)
                x = getCoordinate(2);
            if (j % 15 == 4)
                x = getCoordinate(3);
            if (j % 15 == 5)
                x = getCoordinate(4);
            if (j % 15 == 6)
                x = getCoordinate(5);
            if (j % 15 == 7)
                x = getCoordinate(6);
            if (j % 15 == 8)
                x = getCoordinate(7);
            if (j % 15 == 9)
                x = getCoordinate(8);
            if (j % 15 == 10)
                x = getCoordinate(9);
            if (j % 15 == 11)
                x = getCoordinate(10);
            if (j % 15 == 12)
                x = getCoordinate(11);
            if (j % 15 == 13)
                x = getCoordinate(12);
            if (j % 15 == 14)
                x = getCoordinate(13);
            if (j % 15 == 0)
                x = getCoordinate(14);

            y = getCoordinate(i);
            $('.fieldContainer').append("<div class='rowCol' id='" + i + '_' + j +"'></div>");
        }
    }
}

function addPlayer(container, move, id, row, col)
{
    var y = getCoordinate(row);
    var x = getCoordinate(col);

    var player = gf.addSprite(container, id, {x:x, y:y});

    saveMove(move, id, row, col);
    addMoveableStartingPointBack(player, previousMove());
    return player
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
    }
}

function addMoveableStartingPointBack(div, startingMove)
{
    var row = getMovesRowOrColumn(div, startingMove, "row");
    var col = getMovesRowOrColumn(div, startingMove, "col");

    var y = getCoordinate(row);
    var x = getCoordinate(col);
    var $moveable = $("<div id='" + div.attr('id') + "_start' style='position: absolute;'></div>");

    if (div.attr('id').indexOf('ball') >= 0)
    {
        $moveable.css({backgroundImage: "url(/assets/ball.png)"}).zIndex(1000);
    }
    else
    {
        $moveable.css({backgroundImage: "url(/assets/standing_sprite.png)"}).zIndex(1000);
    }
    $moveable.css({height: 50, width: 50, left: x, top: y}).zIndex(1000);
    $moveable.appendTo(div.parent());
}

function previousMove()
{
    return currentMove==0?0:currentMove-1;
}

function nextMove()
{
    return currentMove+1;
}

function getCoordinate(rowOrCol)
{
    return rowOrCol * moveablesSize
}

function getCountDownDate(millisecs) {
    selectedDate = new Date().valueOf() + millisecs;
    return selectedDate.toString()
}

function runFaceoff()
{
    $('#clock').countdown(getCountDownDate(1000))
        .on('update.countdown', function(event) {
            var format = '%S';
            $(this).html(event.strftime(format));
        })
        .on('finish.countdown', function(event) {
            $(this).html('Draw');
            flickBallOut();
            var containerOffset = $(".fieldContainer").offset();
            var position = $('#ball').position();

            $('#fo_2').animate({
                left: position.left,
                top: position.top
            });
            $(document).on('mousemove', function (e) {
                $('#fo').css({
                    left: e.pageX - containerOffset.left - moveablesSize,
                    top: e.pageY - containerOffset.top
                });
            });
            $('#ball').click(function () {
                currentMove++;
                $('#clock').html('AJAX Feedback here');
                $(document).off('mousemove');
                $('.moveOption').remove();
                var col = calculateRowOrColumnCoordinate($('#fo').css('left').replace("px", ""));
                var row = calculateRowOrColumnCoordinate($('#fo').css('top').replace("px", ""));
                $("#fo").remove();
                addMoveable(currentMove, "fo", row, col+1);
                $("#ball").remove();
                addMoveable(currentMove, "ball", row, col);
                gameState = "PLAY";
                $('#ball').unbind();
                gameLoop();
            });
        });
}

function flickBallOut()
{
    var row = 8;
    var col = 4;

    while (row == 8 && col == 4)
    {
        row = 7 + Math.floor(Math.random() * 3);
        col = 2 + Math.floor(Math.random() * 6);
    }
    currentMove++;
    $('#ball').animate({left: getCoordinate(col) + "px", top: getCoordinate(row) + "px"});
}

function runPlay()
{
    currentMove++;
    addMovesForThisPlay();
}

function addMovesForThisPlay()
{
    $('#ball').draggable({containment: '.fieldContainer', revert: "invalid"});

    $('#clock').countdown(getCountDownDate(5000))
        .on('update.countdown', function(event) {
            var format = '%S';
            $(this).html(event.strftime(format));
        })
        .on('finish.countdown', function(event) {
            $(this).html('now move them');
            animateThisMovesPlay();
        });
}

function animateThisMovesPlay()
{
    var movesInThisPlay = getMovesInThisPlay(currentMove);
    var movesCompleted = 0;

    for (var i = 0; i < moves.length; i++)
    {
        if (moves[i][0] == currentMove)
        {
            var moveTo = getIDCoordinatesByMove(moves[i][1], currentMove);
            $('#' +  moves[i][1] + '_start').animate({top: getCoordinate(moveTo[0]), left: getCoordinate(moveTo[1])});
            var id = moves[i][1];
            $('#' +  moves[i][1] + '_start').promise().done(function()
            {
                var id = $(this).attr('id').substring(0, $(this).attr('id').indexOf('_start'));
                $('#' + id).css('opacity', 1);
                $(this).remove();
                movesCompleted++;
                if (movesInThisPlay == movesCompleted)
                {
                    gameLoop();
                }
            });
        }
    }
    if (movesInThisPlay == 0)
    {
        gameLoop();
    }
}

function getMovesInThisPlay(move)
{
    var moveCount = 0;
    for (var i = 0; i < moves.length; i++)
    {
        if (moves[i][0] == move)
        {
            moveCount++;
        }
    }
    return moveCount;
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

function getMovesRowOrColumn(div, constrainFromMove, rowOrColumn)
{
    var rowOrCol = 0;
    var id = div.id;

    for (var i=moves.length-1; i>=0; i--)
    {
        if (moves[i][0] == constrainFromMove && moves[i][1] == id)
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

function getMoveablesCurrentRowOrColumn(id, rowOrColumn)
{
    var rowOrCol = 0;

    for (var i=moves.length-1; i>=0; i--)
    {
        if (moves[i][0] == currentMove && moves[i][1] == id)
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

function getIDCoordinatesByMove(id, move)
{
    var rowCoord, colCoord;

    for (var i=0; i<moves.length; i++)
    {
        if (moves[i][0] == move && moves[i][1] == id)
        {
            rowCoord = moves[i][2];
            colCoord = moves[i][3];
            break;
        }
    }
    return [rowCoord, colCoord];
}

function getContainmentCoords(div, constrainFromMove)
{
    var row = getMovesRowOrColumn(div, constrainFromMove, "row");
    var col = getMovesRowOrColumn(div, constrainFromMove, "col");

    var containerOffset = $("#"+div.parentElement.id).offset();
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

    var x1 = getCoordinate(startCol) + containerOffset.left;
    var y1 = getCoordinate(startRow) + containerOffset.top;
    var x2 = getCoordinate(stopCol) + containerOffset.left;
    var y2 = getCoordinate(stopRow) + containerOffset.top;

    return [x1, y1, x2 ,y2]
}

function setContainment(div, constrainFromMove)
{
    addVisualMoveOptions(div, constrainFromMove);
    addContainmentToMoveable(div, constrainFromMove);
}

function addContainmentToMoveable(div, constrainFromMove)
{
    var containmentCoords = getContainmentCoords(div, constrainFromMove);

    $("#" + div.id).draggable("option", "containment", containmentCoords);
    $("#" + div.id).data('uiDraggable')._setContainment();
}

function calculateRoundedGridCoordinate(coord)
{
    return Math.round(coord / moveablesSize) * moveablesSize
}

function calculateRowOrColumnCoordinate(coord)
{
    return Math.round((coord / moveablesSize),0)
}

function addVisualMoveOptions(div, constrainFromMove)
{
    var row = getMovesRowOrColumn(div, constrainFromMove, "row");
    var col = getMovesRowOrColumn(div, constrainFromMove, "col");

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
            $("#" + div.parentNode.id).append($moveOption);
        }
    }
}