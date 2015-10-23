$(document).ready(function ()
{
    var moves = [];
    var currentMove = 0;
    var moveablesSize = 50;
    var gameMode = "NOTSET";
    var MYTEAM = true;
    var OPPOSITION = false;
    var myPlayers = [];
    var oppositionPlayers = [];
    var ball = null;
    var ball_start = null;
    var detectCollision = false;
    var collisions = [];
    var possession = "FREE";

    var myTeamPlayerAnim = {
        stand: new gf.animation({
            url: "/assets/standing_sprite.png"
        }),
        runSideways:  new gf.animation({
            url:    "/assets/running_sprite.png",
            numberOfFrames: 3,
            rate: 100
        }),
        runTowards:  new gf.animation({
            url:    "/assets/running_sprite_towards.png",
            numberOfFrames: 3,
            rate: 100
        }),
        runAway:  new gf.animation({
            url:    "/assets/running_sprite_away.png",
            numberOfFrames: 3,
            rate: 100
        }),
        throwSideways:  new gf.animation({
            url:    "/assets/throw_sideways.png",
            numberOfFrames: 3,
            rate: 100
        })
    };

    var oppositionTeamPlayerAnim = {
        stand: new gf.animation({
            url: "/assets/standing_sprite_2.png"
        }),
        runSideways:  new gf.animation({
            url:    "/assets/running_sprite_2.png",
            numberOfFrames: 3,
            rate: 100
        }),
        runTowards:  new gf.animation({
            url:    "/assets/running_sprite_towards_2.png",
            numberOfFrames: 3,
            rate: 100
        }),
        runAway:  new gf.animation({
            url:    "/assets/running_sprite_away_2.png",
            numberOfFrames: 3,
            rate: 100
        }),
        throwSideways:  new gf.animation({
            url:    "/assets/throw_sideways.png",
            numberOfFrames: 3,
            rate: 100
        })
    };

    var faceoffAnim = {
        set:  new gf.animation({
            url:    "/assets/faceoff_set.png",
            width: 100
        }),
        draw:  new gf.animation({
            url:    "/assets/faceoff_spritesheet.png",
            numberOfFrames: 4,
            rate: 300,
            width: 100,
            loop: false
        })
    };

    var refereeAnim = {
        stand:  new gf.animation({
            url:    "/assets/referee_standing.png",
            width: 100,
            height: 100
        }),
        draw:  new gf.animation({
            url:    "/assets/referee_faceoff_321.png",
            numberOfFrames: 4,
            rate: 1000,
            width: 100,
            height: 100,
            loop: false
        }),
        goal:  new gf.animation({
            url:    "/assets/referee_goal.png",
            numberOfFrames: 4,
            rate: 300,
            width: 100,
            height: 100
        })
    };

    var ballAnim = {
        groundball: new gf.animation({
            url: "/assets/ball.png"
        }),
        moving:  new gf.animation({
            url:    "/assets/ball_moving.png",
            numberOfFrames: 3,
            rate: 300
        })
    };

    var MovableBase = function()
    {
        this.update = function ()
        {
            gf.x(this.div, this.div.css('left'));
            gf.y(this.div, this.div.css('top'));
            gf.width(this.div, this.div.css('width'));
            gf.height(this.div, this.div.css('height'));
        };

    };

    var initialize = function()
    {
        $("#splash").remove();
        $('#laxGame').append("<div id='container' style='width: 800px; height: 400px;'>");
        container = $("#container");

        var fieldBackgroundAnim = new gf.animation({url: "/assets/laxfield.jpg", width: 800, height: 400});

        field = gf.addGroup(container, "fieldContainer", {width: 800, height: 400});

        fieldBackground = gf.addSprite(field, "fieldBackground", {width: 800, height: 400});
        gf.setAnimation(fieldBackground, fieldBackgroundAnim);

        $("#shotclock").text("10");
        $("#scoreboard").text("0");
        $("#gametime").text("0");

        // My Team
        var player = new MovableBase();
        player.div = addMoveable(field, currentMove, "player", 2, 3, MYTEAM);
        gf.setAnimation(player.div, myTeamPlayerAnim.stand);
        player.index = myPlayers.length;
        myPlayers.push(player);

        // opposition team
        var player2 = new MovableBase();
        player2.div = addMoveable(field, currentMove, "player2", 3, 3, OPPOSITION);
        gf.setAnimation(player2.div, oppositionTeamPlayerAnim.stand);
        player2.index = oppositionPlayers.length;
        oppositionPlayers.push(player2);

        // ball

        ball = new MovableBase();
        ball.div = addMoveable(field, currentMove, "ball", 1, 1);
        gf.setAnimation(ball.div, ballAnim.groundball);

        ball_start = new MovableBase();
        ball_start.div = addMoveable(field, currentMove, "ball_start", 1, 1);
        ball_start.div.css('opacity', 0).zIndex(1200);

        var faceoff = gf.addSprite(field, "faceoff", {width: 100, height: 100, x: 350, y: 150});
        gf.setAnimation(faceoff, faceoffAnim.set);

        var referee = gf.addSprite(field, "referee", {width: 100, height: 100, x: 250, y: 100});
        gf.setAnimation(referee, refereeAnim.stand);

        $("#startButton").remove();
        container.css("display", "block");
        currentMove++;
    }

    function movePlayers()
    {
        collisions = [];
        for (var i = 0; i < moves.length; i++)
        {
            if (moves[i][0] == currentMove && moves[i][1].indexOf("_start") == -1)
            {
                var div = $('#' + moves[i][1] + "_start");
                gf.transform(div, {flipH: orientSpriteDirection(moves[i])});
                if (moves[i][1].indexOf("ball") == -1)
                {
                    var animType = div.data("myteam") == true ? myTeamPlayerAnim : oppositionTeamPlayerAnim;

                    var XY = previousXY(moves[i][1]);
                    var animMethod = getSpriteRunMethod(animType, moves[i]);
                    /*
                     spriteThrowAndMove(div, animType.throwSideways, animMethod, animType.stand, {
                     y: getCoordinate(moves[i][2]),
                     x: getCoordinate(moves[i][3]),
                     start_x: getCoordinate(XY[0]),
                     start_y: getCoordinate(XY[1])
                     });
                     */
                    // then move
                    var animMethod = getSpriteRunMethod(animType, moves[i]);
                    spriteMove(div, animMethod, animType.stand, {
                        y: getCoordinate(moves[i][2]),
                        x: getCoordinate(moves[i][3])
                    });
                }
                else
                {
                    spriteMove(div, ballAnim.moving, ballAnim.groundball, {
                        y: getCoordinate(moves[i][2]),
                        x: getCoordinate(moves[i][3])
                    });
                }
            }
        }
    }

    function getSpriteRunMethod(animType, moveArrayRow)
    {
        var startRow = 0;
        var finishRow = moveArrayRow[2];
        var startCol = 0;
        var finishCol = moveArrayRow[3];
        var lastMove = previousMove(moveArrayRow[1]);

        for (var i=0; i<moves.length; i++)
        {
            if (moves[i][0] == lastMove && moves[i][1] == moveArrayRow[1])
            {
                startCol = moves[i][3];
                startRow = moves[i][2];
                break;
            }
        }
        if (startCol != finishCol)
        {
            return animType.runSideways
        }
        else if (startRow < finishRow)
        {
            return animType.runTowards
        }
        else
        {
            return animType.runAway
        }
    }

    function addMoveableStartingPointBack(id, startingMove, myTeam)
    {

        var row = getMovesRowOrColumn(id, startingMove, "row");
        var col = getMovesRowOrColumn(id, startingMove, "col");

        var moveable = null;

        if (id.indexOf("ball") == -1)
        {
            for (var i=0; i<myPlayers.length; i++)
            {
                if (myPlayers[i].div.attr('id') == (id + "_start"))
                {
                    moveable = myPlayers[i];
                    break;
                }
            }

            if (moveable == null)
            {
                moveable = new MovableBase();
                moveable.div = addMoveable(field, currentMove, id + "_start", row, col, MYTEAM);
                gf.setAnimation(moveable.div, myTeamPlayerAnim.stand);
                moveable.index = myPlayers.length;
                moveable.div.data("myteam", myTeam);
                myPlayers.push(moveable);
            }

            var animType = moveable.div.data("myteam") == true ? myTeamPlayerAnim : oppositionTeamPlayerAnim;
            gf.setAnimation(moveable.div, animType.stand);
            moveable.div.css('opacity', 1).zIndex(1200);
        }
        else
        {
            gf.setAnimation(ball_start.div, ballAnim.groundball);
            ball_start.div.css('opacity', 1).zIndex(1200);
        }
    }



    var gameLoop = function()
    {
        detectCollisions();
    }

    function detectCollisions()
    {
        if (detectCollision == true)
        {
            // find out where the ball's are
            ball_start.update();

            for (var i = 0; i < myPlayers.length; i++)
            {
                var player = myPlayers[i];
                player.update();
                if (gf.spriteCollide(player.div, ball_start.div))
                {
                    ballCollision(player.div, ball_start.div);
                }

                for (var y = 0; y < oppositionPlayers.length; y++)
                {
                    oppositionPlayers[y].update();
                    if (gf.spriteCollide(oppositionPlayers[y].div, ball_start.div))
                    {
                        ballCollision(oppositionPlayers[y].div, ball_start.div);
                    }

                    if (gf.spriteCollide(player.div, oppositionPlayers[y].div))
                    {
                        playerCollision(player.div, oppositionPlayers[y].div);
                    }
                }
            }
        }
    }

    function playerCollision(moveable1, moveable2)
    {
        console.log(moveable1.data("myteam") + ' ' + moveable1.attr('id') + " collided with " + moveable2.attr('id'));
    }

    function ballCollision(player, ball)
    {
        if (!collisionExists(ball))
        {
            // set the collision data. We then adjust in spriteMove when the animation is complete
            if (player.data("myteam"))
            {
                possession = "MINE";
                gf.removeAnimation(player);
                gf.removeAnimation(ball);
                ball.css('opacity', 0);
                player.css('opacity', 0);
                collisions.push([player.attr('id'), getRoundedGridPosition(gf.x(player)), getRoundedGridPosition(gf.y(player))]);
                collisions.push([ball.attr('id'), getRoundedGridPosition(gf.x(ball)), getRoundedGridPosition(gf.y(ball))]);
            }
            else {
                possession = "THEIRS";
            }

            console.log(possession + ' ' + player.attr('id') + " intercepted ball");
        }
    }

    function collisionExists(div)
    {
        var foundCollision = false;
        for (var i=0; i<collisions.length; i++)
        {
            if (collisions[i][0] == div.attr('id'))
            {
                foundCollision = true;
                break;
            }
        }
        return foundCollision
    }

    var clock = function() {
        var shotclockTime = parseInt($("#shotclock").text());
        var gameTime = parseInt($("#gametime").text());

        if (shotclockTime <= 0)
        {
            detectCollision = true;
            setTimeout(function(){
                possession = "FREE";
                detectCollision = false;
                $("#shotclock").text(10);
                currentMove++;
                $("#instructions").text("Make your next move!! Choose wisely");
            }, 1500);
            movePlayers();
        }
        else
        {
            $("#shotclock").text(shotclockTime-1);
            $("#gametime").text(gameTime+1);
        }
    }

    gf.addCallback(gameLoop, 30);
    gf.addCallback(clock, 1000);

    $("#singlePlayer").click(function() {
        gameMode = "SINGLE";
        gf.startGame(initialize);
    });

    $("#challengeMatch").click(function() {
        gameMode = "CHALLENGE";
        gf.startGame(initialize);
    });

    $("#draggableButton").click(function() {
        currentMove++;
        setDraggable($("#player"));
        setDraggable($("#player2"));
        setDraggable($("#ball"));
    });

    $("#faceoffButton").click(function() {
        var referee = $("#referee");
        gf.setAnimation(referee, refereeAnim.draw);


        setTimeout(function(){
            $("#referee").fadeOut();
            var faceoff = $("#faceoff");
            gf.setAnimation(faceoff, faceoffAnim.draw);
        }, 4000);

        setTimeout(function(){
            var ball = addMoveable(field, currentMove, "ball", 4, 8);
            gf.setAnimation(ball, ballAnim.groundball);
            flickBallOut();
            $("#faceoff").fadeOut();
        }, 5200);

        setTimeout(function() {
            $("#referee").remove();
            $("#faceoff").remove();
        }, 6000);

    });

    function flickBallOut()
    {
        var row = 4;
        var col = 8;

        while (row == 4 && col == 8)
        {
            row = 7 + Math.floor(Math.random() * 3);
            col = 2 + Math.floor(Math.random() * 6);
        }
        currentMove++;

        spriteMove($("#ball"), ballAnim.moving, ballAnim.groundball, {
            y: getCoordinate(col),
            x: getCoordinate(row)
        });
        $('#ball').click(function () {
            $("#instructions").text("Ball Clicked");
        });
    }

    function setDraggable(div)
    {
        div.css( 'cursor', 'move' );
        div.draggable({containment: 'gf_group', revert: "invalid"});
        div.parent().droppable({
            accept: ".gf_sprite",
            activate: dragStarted,
            drop: dragDrop
        });
    }

    function dragStarted(e, ui)
    {
        if (ui.draggable[0].id.indexOf("ball") == -1)
        {
            setContainment(ui.draggable[0].id, previousMove(ui.draggable[0].id));
            $('.moveOption').fadeIn(200);
        }
    }
    function dragDrop(e,ui)
    {
        var id = ui.draggable[0].id;
        $("#" + id).attr('class', 'remove');
        // get x y from draggable
        var xPos = parseInt(ui.draggable[0].style["left"].replace("px", ""));
        var yPos = parseInt(ui.draggable[0].style["top"].replace("px", ""));
        // get the new grid rounded position
        var newXPos = getRoundedGridPosition(xPos);
        var newYPos = getRoundedGridPosition(yPos);
        // calculate the row and column
        var col = (newXPos / moveablesSize);
        var row = (newYPos / moveablesSize);
        // fade out the options
        $('.moveOption').fadeOut(200);
        $('.moveOption').promise().done(function (){$('.moveOption').remove()});

        // add the moved player or ball back
        var moveable = addMoveable($("#"+id).parent(), currentMove, id, row, col, $("#" + id).data("myteam"));
        if (id.indexOf("ball") == -1)
        {
            var animType = moveable.data("myteam") == true ? myTeamPlayerAnim : oppositionTeamPlayerAnim;
            gf.setAnimation(moveable, animType.stand);
        }
        else
        {
            gf.setAnimation(moveable, ballAnim.groundball);
        }
        gf.x(moveable, newXPos);
        gf.y(moveable, newYPos);
        gf.width(moveable, moveable.css('width'));
        gf.height(moveable, moveable.css('height'));
        moveable.css({opacity: 0.3});

        addMoveableStartingPointBack(id, previousMove(id), $("#"+id).data("myteam"));

        // assign the added back div to the stored player item
        if (id.indexOf("ball") == -1)
        {
            for (var i = 0; i < myPlayers.length; i++)
            {
                if (myPlayers[i].div.attr('id') == id)
                {
                    myPlayers[i].div = moveable;
                    break;
                }
            }
        }
        $(".remove").remove();
        setDraggable($("#"+id));
    }

    function addMoveable(container, move, id, row, col, myteam)
    {
        var y = getCoordinate(row);
        var x = getCoordinate(col);

        var player = gf.addSprite(container, id, {x:x, y:y});
        player.data("myteam", myteam);

        saveMove(move, id, row, col);

        if (id.indexOf("_start") == -1)
        {
            player.zIndex(1500);
        }
        else
        {
            player.zIndex(1200);
        }

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

    function getRoundedGridPosition(position)
    {
        return Math.round(parseInt(position) / moveablesSize) * moveablesSize;
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

        setTimeout(function() {
            spriteMove(div, runAnim, endAnim, {
                y: options.y,
                x: options.x
            });
        }, 600);
    }

    function spriteMove(div, startAnim, endAnim, options){
        gf.setAnimation(div, startAnim, true);
        var options = $.extend({
            duration: 1000
        }, options);

        div.animate({
            left: options.x,
            top: options.y
        }, {
            duration: options.duration,
            specialEasing: {
                width: "linear",
                height: "easeOutBounce"
            },
            complete: function()
            {
                // It is always the _start item that moves
                // start and the actual item will always exist
                adjustIfCollided(div);
                gf.setAnimation(div, endAnim);
                toggleStartAndFinish(div);
            }
        });
    }

    function toggleStartAndFinish(startDiv)
    {
        var id = startDiv.attr('id').substring(0, startDiv.attr('id').indexOf("_start"));
        if (startDiv.zIndex() == 1500)
        {
            $('#' + id).css('opacity', 1).zIndex(1500);
            // make _start opacity 0
            $("#" + startDiv.attr('id')).css('opacity', 0).zIndex(1200);
        }
        else
        {
            $('#' + id).css('opacity', 1).zIndex(1200);
            // make _start opacity 0
            $("#" + startDiv.attr('id')).css('opacity', 0).zIndex(1500);
        }
    }

    function adjustIfCollided(startDiv)
    {
        var spliceAt = -1;

        for (var i=0; i<collisions.length; i++)
        {
            if (collisions[i][0] == startDiv.attr('id'))
            {
                var id = startDiv.attr('id').substring(0, startDiv.attr('id').indexOf("_start"));
                spliceAt = i;
                gf.x(startDiv, collisions[i][1]);
                gf.y(startDiv, collisions[i][2]);
                gf.x($("#"+id), collisions[i][1]);
                gf.y($("#"+id), collisions[i][2]);
                break;
            }
        }
        return (spliceAt != -1)
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
});