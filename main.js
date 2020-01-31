var threeD = function() {
    var self = this;
    self.canvas1 = document.getElementById("myCanvas1");
    self.canvas2 = document.getElementById("myCanvas2");
    self.mousedown = false;

    self.canvas1.onmousedown = function(e) {
        var bbox = self.canvas1.getBoundingClientRect();
        self.mouse_x = e.pageX - bbox.left;
        self.mouse_y = e.pageY - bbox.top;
        self.mousedown = true;
    }

    self.canvas1.onmousemove = function(e) {
        if(self.mousedown == true)
        {
            if(self.loadImg.width == 0 || self.loadImg.height == 0) return;
            var bbox = self.canvas1.getBoundingClientRect();
            self.loadImg.delta_x = e.pageX - bbox.left - self.mouse_x;
            self.loadImg.delta_y = e.pageY - bbox.top - self.mouse_y;
        }
    }

    self.canvas1.onmouseup = function() {
        self.mousedown = false;
        self.loadImg.img_x += self.loadImg.delta_x;
        self.loadImg.img_y += self.loadImg.delta_y;
        self.loadImg.delta_x = 0;
        self.loadImg.delta_y = 0;
    }

    // 简单的矩阵库，只支持矩阵乘法
    var Matrix = function(matrix) {
        this.matrix = matrix;
        this.rows = this.matrix.length;     // 行数y
        this.cols = this.matrix[0].length;  // 列数x
    }

    // 矩阵相乘
    Matrix.prototype.dot = function(matrix) {
        var self_matrix = this;
        var cols = matrix.cols;
        var rows = this.rows;
        var result = new Array(rows);
        for(var i = 0; i < rows; i++) {
            result[i] = new Array(cols);
        }
        for(var i = 0; i < cols; i++) {
            for(var j = 0; j < rows; j++) {
                var sum = 0;
                for(var k = 0; k < self_matrix.cols; k++) {
                    sum += self_matrix.matrix[j][k] * matrix.matrix[k][i];
                }
                result[j][i] = sum;
            }
        }
        var new_matrix = new Matrix(result);
        return new_matrix;
    }

    Matrix.prototype.set = function(matrix) {
        this.matrix = matrix;
        this.rows = this.matrix.length;     // 行数y
        this.cols = this.matrix[0].length;  // 列数x
    }

    // 打印矩阵用于调试
    Matrix.prototype.print = function() {
        var str = '';
        for(var i = 0; i < this.rows; i++) {
            for(var j = 0; j < this.cols; j++) {
                str += (this.matrix[i][j] + "\t");
            }
            str += "\n";
        }
        console.log(str);
    }

    // 添加图片类
    var LoadImg = function() {
        this.file = document.getElementById('myFile');
        this.img = new Image();
        this.reader = new FileReader();
        this.img_width = self.canvas1.width;
        this.img_height = self.canvas1.height;
        this.img_scale = 1;
        this.img_x = 0;
        this.img_y = 0;
        this.delta_x = 0;
        this.delta_y = 0;

        var load_img = this;
        document.getElementById("range").onmousemove = function(e) {
            load_img.img_scale = e.srcElement.valueAsNumber / 50;
        }
    }

    LoadImg.prototype.init = function() {
        var load_img = this;
        this.file.onchange = function(event) {
            var selectedFile = event.target.files[0];
            load_img.reader.onload = function(event) {
                load_img.img.src = event.target.result;
                load_img.img.onload = function() {
                    load_img.img_width = load_img.img.width;
                    load_img.img_height = load_img.img.height;
                }
            }
            load_img.reader.readAsDataURL(selectedFile);
        }
    }

    LoadImg.prototype.show = function(context) {
        this.img_width = this.img_scale * this.img.width;
        this.img_height = this.img_scale * this.img.height;
        context.drawImage(this.img, this.img_x + this.delta_x, this.img_y + this.delta_y, this.img_width, this.img_height);
    }

    // 模拟A4纸
    var Paper = function() {
        this.paper_angle = 0; // 弧度
        this.width = 297;
        this.height = 210;
        this.paper_scale = 1;
        this.grid_show = false;
        this.points = [
            [0, this.height * this.paper_scale / 4],
            [this.width * this.paper_scale, this.height * this.paper_scale / 4],
            [0, this.height * this.paper_scale / 2],
            [this.width * this.paper_scale, this.height * this.paper_scale / 2],
            [0, this.height * this.paper_scale * 3 / 4],
            [this.width * this.paper_scale, this.height * this.paper_scale * 3 / 4],
            [this.width * this.paper_scale / 4, 0],
            [this.width * this.paper_scale / 4, this.height * this.paper_scale],
            [this.width * this.paper_scale / 2, 0],
            [this.width * this.paper_scale / 2, this.height * this.paper_scale],
            [this.width * this.paper_scale * 3 / 4, 0],
            [this.width * this.paper_scale * 3 / 4, this.height * this.paper_scale]
        ];
        this.corners = [
            [0, 0],
            [210, 0],
            [210, 297],
            [0, 297]
        ];
        self.canvas2.width = this.width * this.paper_scale;
        self.canvas2.height = this.height * this.paper_scale;

        var paper = this;
        document.getElementById("paper_angle").onmousemove = function(e) {
            paper.paper_angle = (e.srcElement.valueAsNumber - 90) / 180 * 3.14;
        }

        document.getElementById("grid_show").onclick = function() {
            paper.grid_show = (self.paper.grid_show == false) ? true : false;
        }
    }

    // 纸张以中心旋转
    Paper.prototype.rotate = function() {
        var arr =  [[Math.cos(this.paper_angle), -Math.sin(this.paper_angle)],
                    [Math.sin(this.paper_angle), Math.cos(this.paper_angle)]];
        var rotate = new Matrix(arr);
        var corners = [
            [[-105], [-148.5]],
            [[105], [-148.5]],
            [[105], [148.5]],
            [[-105], [148.5]]
        ];
        for(var i = 0; i < corners.length; i++) {
            var point = new Matrix(corners[i]);
            var result = rotate.dot(point);
            this.corners[i][0] = result.matrix[0][0] + 105;
            this.corners[i][1] = result.matrix[1][0] + 148.5;
        }
    }

    // 纸张上的点以中心旋转
    Paper.prototype.rotate_point = function(point) {
        point[0] -= this.height / 2;
        point[1] -= this.width / 2;
        var arr =  [[Math.cos(this.paper_angle), -Math.sin(this.paper_angle)],
                    [Math.sin(this.paper_angle), Math.cos(this.paper_angle)]];
        var rotate = new Matrix(arr);
        var point_matrix = new Matrix([[point[0]],[point[1]]]);
        var result = rotate.dot(point_matrix);
        point[0] = result.matrix[0][0] + this.height / 2;
        point[1] = result.matrix[1][0] + this.width / 2;
        return point;
    }

    // 显示纸张上的栅格
    Paper.prototype.show_grid = function(context1) {
        if(this.grid_show == false) return;
        for(var i = 1; i < 4; i++) {
            var temp_point = [this.height * i / 4, 0];
            temp_point = this.rotate_point(temp_point);
            point = new Matrix([[temp_point[0]], [0], [temp_point[1]], [1]]);
            result = self.camera.intrinsic.dot(self.camera.extrinsic).dot(point);
            context1.moveTo(result.matrix[0][0] / result.matrix[2][0], result.matrix[1][0] / result.matrix[2][0]);
            temp_point = [this.height * i / 4, this.width];
            temp_point = this.rotate_point(temp_point);
            point = new Matrix([[temp_point[0]], [0], [temp_point[1]], [1]]);
            result = self.camera.intrinsic.dot(self.camera.extrinsic).dot(point);
            context1.lineTo(result.matrix[0][0] / result.matrix[2][0], result.matrix[1][0] / result.matrix[2][0]);
        }

        for(var i = 1; i < 4; i++) {
            var temp_point = [0, this.width * i / 4];
            temp_point = this.rotate_point(temp_point);
            point = new Matrix([[temp_point[0]], [0], [temp_point[1]], [1]]);
            result = self.camera.intrinsic.dot(self.camera.extrinsic).dot(point);
            context1.moveTo(result.matrix[0][0] / result.matrix[2][0], result.matrix[1][0] / result.matrix[2][0]);
            temp_point = [this.height, this.width * i / 4];
            temp_point = this.rotate_point(temp_point);
            point = new Matrix([[temp_point[0]], [0], [temp_point[1]], [1]]);
            result = self.camera.intrinsic.dot(self.camera.extrinsic).dot(point);
            context1.lineTo(result.matrix[0][0] / result.matrix[2][0], result.matrix[1][0] / result.matrix[2][0]);
        }
    }

    // 在canvas上显示纸张
    Paper.prototype.show = function(context1) {
        this.rotate();
        var arr =  [[1, 0, 0, -this.height/2 + self.camera.camera_move],
                    [0, 1, 0, self.camera.camera_height],
                    [0, 0, 1, self.camera.camera_distance]];
        self.camera.extrinsic.set(arr);
        var arr1 = [[1, 0, 0],
                    [0, Math.cos(self.camera.camera_angle), -Math.sin(self.camera.camera_angle)],
                    [0, Math.sin(self.camera.camera_angle), Math.cos(self.camera.camera_angle)]];
        self.camera.rotate.set(arr1);
        self.camera.extrinsic = self.camera.rotate.dot(self.camera.extrinsic);
        context1.beginPath();
        var point = new Matrix([[this.corners[3][0]], [0], [this.corners[3][1]], [1]]);
        var result = self.camera.intrinsic.dot(self.camera.extrinsic).dot(point);
        context1.moveTo(result.matrix[0][0] / result.matrix[2][0], result.matrix[1][0] / result.matrix[2][0]);
        // 从左下角逆时针
        for(var i = 0; i < this.corners.length; i++) {
            point = new Matrix([[this.corners[i][0]], [0], [this.corners[i][1]], [1]]);
            result = self.camera.intrinsic.dot(self.camera.extrinsic).dot(point);
            context1.lineTo(result.matrix[0][0] / result.matrix[2][0], result.matrix[1][0] / result.matrix[2][0]);
        }
        this.show_grid(context1);
        context1.strokeStyle = 'red';
        context1.lineWidth = 1;
        context1.stroke();
    }

    // 模拟相机类
    var Camera = function() {
        var arr = [[1000, 0, 400],
                   [0, 1000, 300],
                   [0, 0, 1]];
        this.intrinsic = new Matrix(arr);   // 相机内参
        var arr1 =  [[1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0]];
        this.extrinsic = new Matrix(arr1);  //相机外参
        var arr2 = [[1, 0, 0],
                    [0, 1, 0],
                    [0, 0, 1]];
        this.rotate = new Matrix(arr2);     // 相机旋转矩阵
        this.camera_angle = 0;
        this.camera_distance = 100;
        this.camera_height = 100;
        this.camera_move = 0;

        var camera = this;
        document.getElementById("camera_angle").onmousemove = function(e) {
            camera.camera_angle = e.srcElement.valueAsNumber / 180 * 3.14;
        }
    
        document.getElementById("distance").onmousemove = function(e) {
            camera.camera_distance = e.srcElement.valueAsNumber;
        }
    
        document.getElementById("height").onmousemove = function(e) {
            camera.camera_height = e.srcElement.valueAsNumber;
        }

        document.getElementById("camera_move").onmousemove = function(e) {
            camera.camera_move = (e.srcElement.valueAsNumber - 250);
        }
    }

    // 生成图像
    var Generate = function() {}
    
    Generate.prototype.show = function(context1, context2) {
        var context1 = self.canvas1.getContext('2d');
        var context2 = self.canvas2.getContext('2d');
        context2.clearRect(0, 0, self.canvas2.width, self.canvas2.height);
        var imageData = context2.getImageData(0, 0, self.canvas2.width, self.canvas2.height);
        var img_data = imageData.data;
        for(var i = 0; i < self.paper.width; i++) {
            for(var j = 0; j < self.paper.height; j++) {
                var point = [j, i];
                point = self.paper.rotate_point(point);
                var temp_point = new Matrix([[point[0]], [0], [point[1]], [1]]);
                var result = self.camera.intrinsic.dot(self.camera.extrinsic).dot(temp_point);
                var pixel = context1.getImageData(result.matrix[0][0] / result.matrix[2][0], result.matrix[1][0] / result.matrix[2][0], 1, 1);
                var data = pixel.data;
                img_data[4 * (i + j * self.paper.width)] = data[0];
                img_data[4 * (i + j * self.paper.width) + 1] = data[1];
                img_data[4 * (i + j * self.paper.width) + 2] = data[2];
                img_data[4 * (i + j * self.paper.width) + 3] = data[3];
            }
        }
        context2.putImageData(imageData, 0, 0);
    }

    // canvas渲染类
    var render = function() {}

    render.prototype.start = function() {
        var context1 = self.canvas1.getContext('2d');
        context1.clearRect(0, 0, self.canvas1.width, self.canvas1.height);
        self.paper.show(context1);
        self.loadImg.show(context1);
    }

    self.init = function() {
        self.loadImg = new LoadImg();
        self.loadImg.init();
        self.camera = new Camera();
        self.paper = new Paper();
        self.generate = new Generate();
        self.render = new render();
        self.interval = setInterval(self.render.start, 20);

        document.getElementById("generate").onclick = function() {
            self.generate.show();
        }

        window.onblur = function() {
            clearInterval(self.interval);
        }
    
        window.onfocus = function() {
            self.interval = setInterval(self.render.start, 20);
        }
    }
}

new threeD().init();