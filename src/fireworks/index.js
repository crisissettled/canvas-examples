// https://juejin.cn/post/7334311273340239887

function updateMouseCoordinates(e) {
  let rect = canvas.getBoundingClientRect();
  mouseCoordinates.x = e.clientX - rect.left;
  mouseCoordinates.y = e.clientY - rect.top;
}

function addLineSegment() {
  if (lineSegment.draw) {
    let one = new Line(
      lineSegment.x,
      lineSegment.y,
      lineSegment.x2,
      lineSegment.y2
    );

    arr.push(one);
  }
}

function createBullet() {
  for (var i = 0; i < 360; i += 15) {
    // 间隔15°

    let x = mouseCoordinates.x;
    let y = mouseCoordinates.y;
    let angle = (i * Math.PI) / 180; //弧度转为角度
    let one = new Bullet(x, y, angle);

    arr.push(one);
  }
}

function addCircleDot() {
  //找到圆的数组
  let circleArr = arr.filter((item) => item.name === "CircleDot");

  let x = mouseCoordinates.x;
  let y = mouseCoordinates.y;

  //重复圆不叠加
  if (!circleArr.some((obj) => obj.x === x && obj.y === y)) {
    let one = new CircleDot(x, y);
    arr.push(one);
  }
}

function drawCross(x, y) {
  // 绘制十字线
  c2d.save();
  let text = `( ${Math.round(x)}  , ${Math.round(y)} )`;
  let textSize = c2d.measureText(text);
  let textX = x + 10; // 右偏移量以离开鼠标点
  let textY = y - 10; // 上偏移量以放在鼠标点上方

  //判断 如果 x 靠近右侧边缘 , y靠近上册边缘
  if (x >= canvas.width - 80) {
    textX = x - 80;
  }

  if (y < 50) {
    textY = y + 30;
  }

  c2d.fillStyle = "red"; // 设置文本颜色为红色
  c2d.fillText(text, textX, textY);

  // 设置十字线的颜色和粗细

  c2d.strokeStyle = "#FF0000"; // 示例颜色为红色

  c2d.lineWidth = 1; // 示例设置更明显的线宽

  // 水平线
  c2d.beginPath();
  c2d.moveTo(x, 0);
  c2d.lineTo(x, canvas.height);
  c2d.stroke();

  // 垂直线
  c2d.beginPath();
  c2d.moveTo(0, y);
  c2d.lineTo(canvas.width, y);
  c2d.stroke();

  c2d.restore();
} //drawCross

/*
    找到不会碰撞的情况，的反面就是碰撞
    存在任何一种未碰撞的状态，就是没有碰撞
  */
class Tool {
  /* 声明一个工具类 */

  //绘制网格
  drawGrid(c2d, sizeX = 10, sizeY = 10, color = "lightgray") {
    c2d.save(); //新建一个绘图状态
    //设置一些参数
    c2d.strokeStyle = color; //设置线条颜色
    c2d.lineWidth = 0.5; //绘制线条的宽度

    //绘制水平辅助线
    for (let x = sizeX + 0.5; x < c2d.canvas.width; x += sizeX) {
      c2d.beginPath(); //开始一个独立的路径
      c2d.moveTo(x, 0);
      c2d.lineTo(x, c2d.canvas.height);
      c2d.stroke();
    }

    //绘制垂直辅助线
    for (let y = sizeY + 0.5; y < c2d.canvas.height; y += sizeY) {
      c2d.beginPath(); //开始一个独立的路径
      c2d.moveTo(0, y);
      c2d.lineTo(c2d.canvas.width, y);
      c2d.stroke();
    }

    c2d.restore(); //返回"新建sava()"之前的画布状态
  } //end drawGrid

  pz(A, B) {
    //碰撞
    let isPz = false; //假设没有碰撞

    //B 在A的
    let f1 = A.x + A.w <= B.x; //B在A的右边
    let f2 = A.y + A.h <= B.y; //B在A的下边
    let f3 = A.x >= B.x + B.w; //B在A的左边
    let f4 = A.y >= B.y + B.h; //B在A的上边
    // f1||f2||f3||f4 以上任何一种 结果为真
    if (!(f1 || f2 || f3 || f4)) {
      //不在4种情况中的任一种
      isPz = true; //碰撞
    }
    return isPz;
  }
} //end Tool

//通用物体类
class W {
  constructor(x, y, name = "名字") {
    this.x = x;
    this.y = y;
    this.name = name;
    //自身动画相关的
    this.i = -1; //表示裁剪的图片位置
    this.imgW = 80; //裁剪的宽度

    this.sx = 0; //裁剪的起始x坐标
    this.t = 0; //存放上一次图片切换的时间
  }

  animate(nowTime) {
    //自身的图片切换 自带判断 是否切换
    if (nowTime - this.t > 200) {
      //时间间隔大于 xx 毫秒 我们才切换图片
      //super 父类
      this.i++;
      if (this.i == 4) {
        this.i = 0;
      }
      this.sx = this.i * this.imgW;

      this.t = nowTime; //更新上一次图片切换的时间
    }
  }
} //结束 物体类

class Bullet extends W {
  constructor(x, y, angle, v = 1) {
    super(x, y, "Bullet");

    this.angle = angle;
    this.v = v;
  }

  move() {
    this.x += Math.cos(this.angle) * this.v;
    this.y += Math.sin(this.angle) * this.v;
  }

  draw(c2d) {
    this.move();
    c2d.save();
    c2d.beginPath();
    c2d.arc(this.x, this.y, 2, 0, Math.PI * 2);
    c2d.fillStyle = "#0095DD";
    c2d.fill();
    c2d.closePath();

    c2d.restore();
  }
}

//创建一个线条类
class Line extends W {
  constructor(x, y, x2, y2) {
    super(x, y, "lineSegment");

    this.x2 = x2;
    this.y2 = y2;
  }

  draw(c2d) {
    c2d.save();

    c2d.beginPath();
    c2d.moveTo(this.x, this.y);
    c2d.lineTo(this.x2, this.y2);

    c2d.strokeStyle = "orange"; // 线条颜色
    c2d.lineWidth = 2; // 线宽
    c2d.closePath();
    c2d.stroke();

    c2d.restore();
  }
} //

// 绘制一个圆圈
class CircleDot extends W {
  constructor(x, y) {
    super(x, y, "CircleDot");
  }

  draw(c2d) {
    c2d.save();
    c2d.beginPath();
    c2d.arc(this.x, this.y, 20, 0, Math.PI * 2);
    c2d.strokeStyle = "blue"; // 可以设置不同的颜色
    c2d.stroke();

    // 如果需要在点击点处额外显示一个小圆点

    //圆心
    c2d.beginPath();
    c2d.arc(this.x, this.y, 2, 0, Math.PI * 2); // 半径为5的圆点
    c2d.fillStyle = "green"; // 设置填充颜色
    c2d.fill();

    //写上坐标
    let text = `(${Math.round(this.x)},${Math.round(this.y)})`;
    c2d.fillText(text, this.x + 5, this.y);

    c2d.restore();
  }
}

//声明一个敌人类 继承物体类
class Enemy extends W {
  constructor(x, y) {
    super(x, y); //调用父类的构造方法
    this.w = 50; //宽度
    this.h = 50; //高度
    this.vx = -Math.random() * 5; // 0~-5  水平速度
    this.vy = Math.random() * 6 - 3; //-3~3之间A
  }

  update(nowTime) {
    //TO DO 判断是否需要切换图片
    this.animate(nowTime);

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(c2d, nowTime) {
    //画图方法  nowTime 当前的时刻 毫秒 不断增加
    this.update(nowTime);
    c2d.save();
    c2d.strokeStyle = "blue";

    let sArr = [this.sx, 0, 80, 80]; //裁剪的位置
    let dArr = [this.x, this.y, this.w, this.h]; //绘制的位置

    // 创建渐变
    let color = c2d.createLinearGradient(0, 0, c2d.canvas.width, 0);
    c2d.font = "14px Verdana";
    color.addColorStop("0", "green");
    color.addColorStop("0.5", "red");
    color.addColorStop("1.0", "green");
    // 用渐变填色
    c2d.fillStyle = color;

    //context.fillText(文本,x,y,最大宽度);
    c2d.fillText("18级web班", this.x + this.w, this.y + this.h / 2);

    c2d.fillStyle = "blue"; //填充的颜色
    c2d.fillRect(this.x, this.y - 3, this.w - 2, 5); //绘制血条

    c2d.drawImage(img2, ...sArr, ...dArr); //画图
    //c2d.drawImage(img2,0,0,80,80,this.x,this.y,this.w,this.h);

    //c2d.strokeRect(this.x,this.y,this.w,this.h);
    c2d.restore();
  } //draw
} //end Enemy 敌人类

//声明一个子弹类
class Hit {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 8; //宽度
    this.h = 3; //高度
    this.vx = 5; //水平速度
  }
  update() {
    this.x += this.vx * 1;
  }
  draw(c2d) {
    //画图方法
    this.update();
    c2d.save(); //画布的状态存档

    c2d.fillStyle = "red";
    c2d.fillRect(this.x, this.y, this.w, this.h);
    c2d.restore(); //读取画布save之前的状态
  }
} //结束Hit类声明

//声明一个飞船类Ship
class Ship extends W {
  constructor(x, y) {
    super(x, y); //调用父类的构造函数 手写这个代码

    this.w = 100; //宽度
    this.h = 50; //高度
    this.vx = 3; //水平速度
    this.vy = 3; //垂直速度

    this.imgW = 100; //每张图片裁剪的宽度
  }

  update(nowTime) {
    //更新飞船的位置

    //图片切换
    //TO DO 判断是否需要切换图片
    this.animate(nowTime);

    //当飞船上下移动
    //飞船向左 - vx
    //飞船向右 + vx
    //飞船向上 -vy
    //飞船向下 +vy
    if (keyObj.左) {
      this.x -= this.vx;
    }
    if (keyObj.右) {
      this.x += this.vx;
    }
    if (keyObj.上) {
      this.y -= this.vy;
    }
    if (keyObj.下) {
      this.y += this.vy;
    }
  } // update

  draw(c2d, nowTime) {
    //画图方法
    this.update(nowTime);

    //400 x 40
    let sArr = [this.sx, 0, 100, 40]; //裁剪的位置 第一张图
    let dArr = [this.x, this.y, this.w, this.h]; //绘制的位置

    c2d.drawImage(img1, ...sArr, ...dArr); //画图
    //c2d.fillRect(this.x,this.y,this.w,this.h);
    //c2d.fillRect(this.x+this.w,this.y+22,10,5);
  }
}

let canvas = document.querySelector("#canvas");

let c2d = canvas.getContext("2d");
let tool = new Tool(); //创建一个工具人

let nowTime = 0;

let gridHeight;
const gridWidth = (gridHeight = 10);

let arr = []; //存放全局绘图对象 ，包括 圆点、线段、子弹等
let mouseCoordinates = {
  //定义鼠标的坐标
  x: 0,
  y: 0,
};

let lineSegment = {
  //定义一个 lineSegment 起点(x,y) 终点(x2,y2)
  draw: false, //表示是否开始画一个线段
  x: 0,
  y: 0,
  x2: 0,
  y2: 0,
};

//初始化,画布铺满屏幕
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//监听页面尺寸变化
window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

canvas.addEventListener("mousedown", (e) => {
  lineSegment.draw = true;

  updateMouseCoordinates(e);
  addCircleDot();

  lineSegment.x = mouseCoordinates.x;
  lineSegment.y = mouseCoordinates.y;

  canvas.addEventListener("mouseup", (e) => {
    addCircleDot();
    createBullet(); // ********此处调用***********
    lineSegment.draw = false;
    lineSegment.x = mouseCoordinates.x;
    lineSegment.y = mouseCoordinates.y;
  });
});

canvas.addEventListener("mousemove", (e) => {
  updateMouseCoordinates(e);
  lineSegment.x2 = mouseCoordinates.x;
  lineSegment.y2 = mouseCoordinates.y;

  addLineSegment();

  lineSegment.x = mouseCoordinates.x;
  lineSegment.y = mouseCoordinates.y;
});

animate(); //循环动画函数
function animate(t) {
  //t表示当前时间 毫秒 一直在增加
  nowTime = t; //暂未用到
  c2d.clearRect(0, 0, canvas.width, canvas.height);

  //设置网格线
  tool.drawGrid(c2d, gridWidth, gridHeight);

  drawCross(mouseCoordinates.x, mouseCoordinates.y);

  for (let one of arr) {
    one.draw(c2d);
  }

  requestAnimationFrame(animate); //每隔16.67ms去调用
}
