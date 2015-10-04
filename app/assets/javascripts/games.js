var moves = [];
var currentMove = 0;
var moveablesSize = 50;
var MYTEAM = true;
var OPPOSITION = false;

function addMoveable(container, move, id, row, col, myteam)
{
    var y = getCoordinate(row);
    var x = getCoordinate(col);

    var player = gf.addSprite(container, id, {x:x, y:y});
    player.data("myteam", myteam);
    saveMove(move, id, row, col);

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

function previousMove()
{
    return currentMove==0?0:currentMove-1;
}

function previousMove(id)
{
    var lastMove = 0;
    // last time this id object moved
    for (var i=moves.length-1; i>=0; i--)
    {
        if (moves[i][1] == id && moves[i][0] != currentMove)
        {
            lastMove = moves[i][0]
            break;
        }
    }
    return lastMove;
}

function previousXY(id)
{
    var XY = [];
    // last time this id object moved
    for (var i=moves.length-1; i>=0; i--)
    {
        if (moves[i][1] == id && moves[i][0] != currentMove)
        {
            XY.push(moves[i][3]);
            XY.push(moves[i][2]);
            break;
        }
    }
    return XY;
}

function nextMove()
{
    return currentMove+1;
}

function getCoordinate(rowOrCol)
{
    return rowOrCol * moveablesSize
}

function orientSpriteDirection(movesArrayRow)
{
    var startFrom = 0;
    var finishAt = movesArrayRow[3];
    var lastMove = previousMove(movesArrayRow[1]);


    for (var i=0; i<moves.length; i++)
    {
        if (moves[i][0] == lastMove && moves[i][1] == movesArrayRow[1])
        {
            startFrom = moves[i][3];
            break;
        }
    }
    return (finishAt < startFrom)
}

function spriteThrowAndMove(div, throwAnim, runAnim, endAnim, options)
{
    gf.setAnimation(div, throwAnim, false);
    var options = $.extend({
        duration: 1000
    }, options);

    div.animate({
        left: options.start_x,
        top: options.start_y
    }, {
        duration: 300,
        specialEasing: {
            width: "linear",
            height: "easeOutBounce"
        },
        complete: function() {
            gf.spriteMove(div, runAnim, endAnim, {
                y: options.y,
                x: options.x,
                removeWhenDone: true,
                replaceWithDiv: options.replaceWithDiv
            });
        }
    });
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

function getMovesRowOrColumn(id, constrainFromMove, rowOrColumn)
{
    var rowOrCol = 0;

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

function getContainmentCoords(id, constrainFromMove)
{
    var row = getMovesRowOrColumn(id, constrainFromMove, "row");
    var col = getMovesRowOrColumn(id, constrainFromMove, "col");

    var containerOffset = $("#"+id).parent().offset();
    var startRow = row - 2;
    var stopRow = row + 2;
    var startCol = col - 2;
    var stopCol = col + 2;

    if ( row <= 1)
    {
        startRow = 0;
    }
    if (row >= 7)
    {
        stopRow = 7;
    }
    if (col <= 1)
    {
        startCol = 0;
    }
    if (col >= 15)
    {
        stopCol = 15;
    }

    var x1 = getCoordinate(startCol) + containerOffset.left;
    var y1 = getCoordinate(startRow) + containerOffset.top;
    var x2 = getCoordinate(stopCol) + containerOffset.left;
    var y2 = getCoordinate(stopRow) + containerOffset.top;

    return [x1, y1, x2 ,y2]
}

function setContainment(id, constrainFromMove)
{
    addVisualMoveOptions(id, constrainFromMove);
    addContainmentToMoveable(id, constrainFromMove);
}

function addContainmentToMoveable(id, constrainFromMove)
{
    var containmentCoords = getContainmentCoords(id, constrainFromMove);

    $("#" + id).draggable("option", "containment", containmentCoords);
    $("#" + id).data('uiDraggable')._setContainment();
}

function calculateRoundedGridCoordinate(coord)
{
    return Math.round(coord / moveablesSize) * moveablesSize
}

function calculateRowOrColumnCoordinate(coord)
{
    return Math.round((coord / moveablesSize),0)
}

function addVisualMoveOptions(id, constrainFromMove)
{
    var row = getMovesRowOrColumn(id, constrainFromMove, "row");
    var col = getMovesRowOrColumn(id, constrainFromMove, "col");

    var startRow = row - 2;
    var stopRow = row + 2;
    var startCol = col - 2;
    var stopCol = col + 2;
    if ( startRow < 0)
    {
        startRow = 0;
    }
    if (stopRow > 7)
    {
        stopRow = 7;
    }
    if (startCol < 0)
    {
        startCol = 0;
    }
    if (stopCol > 15)
    {
        stopCol = 15;
    }

    for (var i=startRow; i<=stopRow; i++)
    {
        for (var j=startCol; j<=stopCol; j++)
        {
            var $moveOption = $('#moveToSpot').clone();
            $moveOption.css({left: getCoordinate(j), top: getCoordinate(i), opacity: 1}).attr('class', 'moveOption');
            $("#" + id).parent().append($moveOption);
        }
    }
}