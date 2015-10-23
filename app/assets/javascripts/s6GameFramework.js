gf = {

    baseRate: 30
};

gf.imagesToPreload = [];

gf.initialise = function(options)
{
    $.extend(gf, options);
}

gf.startGame = function(endCallback, progressCallback) {
    var images = [];
    var total = gf.imagesToPreload.length;

    for (var i = 0; i < total; i++) {
        var image = new Image();
        images.push(image);
        image.src = gf.imagesToPreload[i];
    }
    var preloadingPoller = setInterval(function() {
        var counter = 0;
        var total = gf.imagesToPreload.length;
        for (var i = 0; i < total; i++) {
            if (images[i].complete) {
                counter++;
            }
        }
        if (counter == total) {
            //we are done!
            clearInterval(preloadingPoller);
            endCallback();
            setInterval(gf.refreshGame, gf.baseRate);
            gf.time = (new Date()).getTime();
        } else {
            if (progressCallback) {
                counter++;
                progressCallback((counter / total) * 100);
            }
        }
    }, 100);
};

gf.preload = function ()
{
    gf.initialiseRowsAndColumns();
    gf.initialiseMoveables();
}

gf.addImage = function(url)
{
    if ($.inArray(url, gf.imagesToPreload) < 0)
    {
        gf.imagesToPreload.push(url);
    }
}

gf.animation = function(options)
{
    var defaultValues = {
        url: false,
        width: 50,
        height: 50,
        numberOfFrames: 1,
        currentFrame: 0,
        offset: 0,
        rate: 1
    }
    $.extend(this, defaultValues, options);
    if (options.rate)
    {
        this.rate = Math.round(this.rate/gf.baseRate);
    }
    if (this.url)
    {
        gf.addImage(this.url);
    }
}

gf.setFrame = function(div, animation) {
    div.css("backgroundPosition", "-" + (animation.currentFrame * animation.width + animation.offset) + "px 0px");
}

gf.animations = [];

gf.refreshGame = function (){

    // update animations
    var finishedAnimations = [];

    for (var i=0; i < gf.animations.length; i++) {

        var animate = gf.animations[i];

        animate.counter++;
        if (animate.counter == animate.animation.rate)
        {
            animate.counter = 0;
            animate.animation.currentFrame++;
            if(!animate.loop && animate.animation.currentFrame >= animate.animation.numberOfFrames)
            {
                finishedAnimations.push(i);
            }
            else
            {
                animate.animation.currentFrame %= animate.animation.numberOfFrames;
                gf.setFrame(animate.div, animate.animation);
            }
        }
    }
    for(var i=0; i < finishedAnimations.length; i++)
    {
        gf.animations.splice(finishedAnimations[i], 1);
    }

    // execute the callbacks
    for (var i=0; i < gf.callbacks.length; i++)
    {
        var call  = gf.callbacks[i];

        call.counter++;
        if (call.counter == call.rate)
        {
            var currentTime = (new Date()).getTime();
            call.counter = 0;
            call.callback(currentTime - gf.time);
        }
    }
    gf.time = (new Date()).getTime();
}

gf.removeAnimation = function(div)
{
    for (var i=0; i < gf.animations.length; i++)
    {

        if (gf.animations[i].div.attr('id') == div.attr('id'))
        {
            gf.animations.splice(i, 1);
            break;
        }
    }
}

gf.setAnimation = function(div, animation, loop)
{
    var animate = {
        animation: $.extend({}, animation),
        div: div,
        loop: loop,
        counter: 0
    }
    if (animation.url)
    {
        div.css("backgroundImage", "url("+animation.url+")");
    }
    // search if this div already has an animation
    var divFound = false;
    for (var i = 0; i < gf.animations.length; i++) {
        if(gf.animations[i].div.is(div)){
            divFound = true;
            gf.animations[i] = animate;
        }
    }

    // otherwise we add it to the array
    if(!divFound) {
        gf.animations.push(animate);
    }
}

gf.callbacks = [];

gf.addCallback = function(callback, rate)
{
    gf.callbacks.push({
        callback: callback,
        rate: Math.round(rate/gf.baseRate),
        counter: 0
    });
}

gf.previousMove = function()
{
    return gf.currentMove==0?0:gf.currentMove - 1;
}

gf.addSprite = function(parent, divId, options)
{
    var options = $.extend({
        x: 0,
        y: 0,
        row: 0,
        col: 0,
        width: 50,
        height: 50,
        flipH: false,
        flipV: false,
        rotate: 0,
        scale: 1
    }, options);
    var sprite = gf.spriteFragment.clone().css({left: options.x, top: options.y, width: options.width, height: options.height}).attr('id', divId).data("gf", options);

    if (sprite.data("gf") == undefined)
    {
        sprite.data("gf", options);
    }

    parent.append(sprite);
    return sprite;
}

gf.transform = function(div, options){

    var options = $.extend({
        x: 0,
        y: 0,
        row: 0,
        col: 0,
        width: 50,
        height: 50,
        flipH: false,
        flipV: false,
        rotate: 0,
        scale: 1
    }, options);

    var gf = div.data("gf");

    if(options.flipH !== undefined){
        gf.flipH = options.flipH;
    }
    if(options.flipV !== undefined){
        gf.flipV = options.flipV;
    }
    if(options.rotate !== undefined){
        gf.rotate = options.rotate;
    }
    if(options.scale !== undefined){
        gf.scale = options.scale;
    }
    var factorH = gf.flipH ? -1 : 1;
    var factorV = gf.flipV ? -1 : 1;
    div.css("transform", "rotate("+gf.rotate+"deg) scale("+(gf.scale*factorH)+","+(gf.scale*factorV)+")");
}

gf.spriteFragment = $("<div style='position: absolute; overflow: hidden;' class='gf_sprite'></div>");
gf.groupFragment = $("<div style='position: absolute; overflow: visible;' class='gf_group'></div>");

gf.addGroup = function(parent, divId, options)
{
    var options = $.extend({
        height: 0,
        width: 0
    }, options);
    var group = gf.groupFragment.clone().css({height: options.height, width: options.width}).attr('id', divId).data("gf", options);
    parent.append(group);
    return group;
}

/**
 * This function sets or returns the position along the x-axis.
 **/
gf.x = function(div,position) {
    if(position) {
        div.css("left", position);
        div.data("gf").x = position;
    } else {
        return div.data("gf").x;
    }
}
/**
 * This function sets or returns the position along the y-axis.
 **/
gf.y = function(div,position) {
    if(position) {
        div.css("top", position);
        div.data("gf").y = position;
    } else {
        return div.data("gf").y;
    }
}

gf.width = function(div,dimension) {
    if(dimension) {
        div.css("width", dimension);
        div.data("gf").width = dimension;
    } else {
        return div.data("gf").width;
    }
}

gf.height = function(div,dimension) {
    if(dimension) {
        div.css("height", dimension);
        div.data("gf").height = dimension;
    } else {
        return div.data("gf").height;
    }
}

gf.intersect = function(a1,a2,b1,b2){
    var i1 = Math.min(Math.max(a1, b1), a2);
    var i2 = Math.max(Math.min(a2, b2), a1);
    return [i1, i2];
}

gf.spriteCollide = function(sprite1, sprite2){
    var option1 = sprite1.data("gf");
    var option2 = sprite2.data("gf");

    var x = gf.intersect(
        parseInt(option1.x),
        parseInt(option1.x) + parseInt(option1.width),
        parseInt(option2.x),
            parseInt(option2.x) + parseInt(option2.width));
    var y = gf.intersect(
        parseInt(option1.y),
        parseInt(option1.y) + parseInt(option1.height),
        parseInt(option2.y),
        parseInt(option2.y) + parseInt(option2.height));

    if (x[0] == x[1] || y[0] == y[1])
    {
        return false;
    }
    else
    {
        return true;
    }
}
