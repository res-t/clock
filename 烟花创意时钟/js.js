// JavaScript Document
var BoidClock = (function() {
'use strict';
  function Point(pos, targetPos) {
    this.pos = pos; 
    this.targetPos = targetPos;
    this.vels = { vx: Math.random() * 5 + 2, vy: Math.random() * 5 + 2 };
    this.speed = 0.4;
    this.friction = 0.5;
    this.angle = Math.random() * 360;
  }

  Point.prototype.moveTo = function(target) {
    this.vels.vx += (target.pos.x - this.pos.x) * this.speed;
    this.vels.vy += (target.pos.y - this.pos.y) * this.speed;
    this.vels.vx *= this.friction;
    this.vels.vy *= this.friction;
    this.pos.x += this.vels.vx;
    this.pos.y += this.vels.vy;
  };

  function Boid(points) {
    this.points = points;
    this.radius = 2.5 + Math.random();
  }

  Boid.prototype.render = function(ctx) {
    var self = this;
    ctx.save();
  ctx.lineWidth = 1;
    ctx.strokeStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(self.points[0].pos.x, self.points[0].pos.y);
    self.points.forEach(function(p, i) {
      if (i !== self.points.length - 1) {
        p.moveTo(self.points[i + 1]);
      }
      ctx.lineTo(p.pos.x, p.pos.y);
    });
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(self.points[self.points.length - 1].pos.x, self.points[self.points.length - 1].pos.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),

      tempCanvas = document.createElement('canvas'),
      tempCtx = tempCanvas.getContext('2d'),

      width = window.innerWidth,
      height = window.innerHeight,

      clockActive = false,
      boids = [],
      pixelPositions = [];

  function init() {
    setUpCanvas();
    updatePixelPosition(updateClock());
    generateBoids(pixelPositions.length + 25);
    startTimeInterval();
    render();
  }

  function setUpCanvas() {
    canvas.width = tempCanvas.width = width;
    canvas.height = tempCanvas.height = height;
    document.body.appendChild(canvas);
    //document.body.appendChild(tempCanvas);
    ctx.fillStyle = '#111';
  }

  function generateBoids(num) {
    var segmentCount = 4;
    for (var n = 0; n < num; n += 1) {
      var points = [];
      for (var i = 0; i < segmentCount; i += 1) {
        var point = new Point({ x: width / 2, y: height / 2 }, { x: Math.random() * width, y: Math.random() * height });
        points.push(point);
      }
      var boid = new Boid(points);
      boids.push(boid);
    }
  }

  function updateClock() {
    var date = new Date();
    var hours, minutes, seconds;

    hours = date.getHours();
    minutes = date.getMinutes();
    seconds = date.getSeconds();

    if (hours.toString().length === 1) hours = '0' + hours;
    if (minutes.toString().length === 1) minutes = '0' + minutes;
    if (seconds.toString().length === 1) seconds = '0' + seconds;

    return hours + ':' + minutes + ':' + seconds;

  }

  function updatePixelPosition(time) {
    pixelPositions = [];
    tempCtx.clearRect(0, 0, width, height);
    tempCtx.fillStyle = '#000';
    tempCtx.font = 'bold ' + width / 10 + 'px Arial';
    tempCtx.fillText(time, width / 2 - tempCtx.measureText(time).width / 2, height / 2 + 50);
    var idata = tempCtx.getImageData(0, 0, width, height);
    var buffer = new Uint32Array(idata.data.buffer);
    var grid = 10;
    var range = 4;
    for (var y = 0; y < height; y += grid) {
      for (var x = 0; x < width; x += grid) {
        var offset = range / 2 + Math.random() * (range / 2);
        if (buffer[y * width + x]) {
          pixelPositions.push({ x: x + offset, y: y + offset });
        }
      }
    }
  }

  function startTimeInterval() {
    var index = 0;
    setInterval(function() {
      updatePixelPosition(updateClock());
      if (index % 2 === 0) { clockActive = true; } 
      else if (index % 2 !== 0) { clockActive = false; }
      index += 1;
    }, 500);
  }

  function render() {
    window.requestAnimationFrame(render, canvas);
    ctx.fillRect(0, 0, width, height);
    boids.forEach(renderBoid);
  }

  function renderBoid(boid, i) {
    var pixelPosition = pixelPositions[i];
    var len = boid.points.length - 1;
    if (pixelPosition) {
      if (clockActive) {
        boid.points[len].vels.vx += (pixelPosition.x - boid.points[len].pos.x) * boid.points[0].speed;
        boid.points[len].vels.vy += (pixelPosition.y - boid.points[len].pos.y) * boid.points[0].speed;
      } else {
        boid.points[len].vels.vx += (boid.points[len].targetPos.x - boid.points[len].pos.x) * boid.points[0].speed / 30;
        boid.points[len].vels.vy += (boid.points[len].targetPos.y - boid.points[len].pos.y) * boid.points[0].speed / 30;
      }
    } else {
      boid.points[len].vels.vx += Math.sin(boid.points[len].angle) * 20;
      boid.points[len].vels.vy += Math.cos(boid.points[len].angle) * 20;
      boid.points[len].angle += boid.points[len].speed / 10;
    }
    boid.points[len].vels.vx *= boid.points[len].friction;
    boid.points[len].vels.vy *= boid.points[len].friction;
    boid.points[len].pos.x += boid.points[len].vels.vx;
    boid.points[len].pos.y += boid.points[len].vels.vy;
    boid.render(ctx);
  }

  return {
    init: init
  };

}());

window.onload = BoidClock.init;