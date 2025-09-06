<template>
    <div>
        <canvas
            id="s-canvas"
            :width="contentWidth"
            :height="contentHeight"
        ></canvas>
    </div>
</template>

<script>
export default {
    name: "identify",
    props: {
        identifyCode: {
            type: Object,
            default: "",
        },
        fontSizeMin: {
            type: Number,
            default: 28,
        },
        fontSizeMax: {
            type: Number,
            default: 40,
        },
        backgroundColorMin: {
            type: Number,
            default: 180,
        },
        backgroundColorMax: {
            type: Number,
            default: 240,
        },
        colorMin: {
            type: Number,
            default: 50,
        },
        colorMax: {
            type: Number,
            default: 160,
        },
        lineColorMin: {
            type: Number,
            default: 40,
        },
        lineColorMax: {
            type: Number,
            default: 180,
        },
        dotColorMin: {
            type: Number,
            default: 0,
        },
        dotColorMax: {
            type: Number,
            default: 255,
        },
        contentWidth: {
            type: Number,
            default: 130,
        },
        contentHeight: {
            type: Number,
            default: 40,
        },
    },
    methods: {
        // Generate a random number
        randomNum(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        },
        // Generate a random color
        randomColor(min, max) {
            let r = this.randomNum(min, max);
            let g = this.randomNum(min, max);
            let b = this.randomNum(min, max);
            return "rgb(" + r + "," + g + "," + b + ")";
        },
        drawPic() {
            let canvas = document.getElementById("s-canvas");
            let ctx = canvas.getContext("2d");
            ctx.textBaseline = "bottom";
            // Draw the background
            ctx.fillStyle = this.randomColor(
                this.backgroundColorMin,
                this.backgroundColorMax
            );
            ctx.fillRect(0, 0, this.contentWidth, this.contentHeight);
            // Draw text
            for (let i = 0; i < this.identifyCode.value.length; i++) {
                this.drawText(ctx, this.identifyCode.value[i], i);
            }
            this.drawLine(ctx);
            this.drawDot(ctx);
        },
        drawText(ctx, txt, i) {
            ctx.fillStyle = this.randomColor(this.colorMin, this.colorMax);
            ctx.font =
                this.randomNum(this.fontSizeMin, this.fontSizeMax) +
                "px SimHei";
            let x =
                (i + 1) * (this.contentWidth / (this.identifyCode.value.length + 1));
            let y = this.randomNum(this.fontSizeMax, this.contentHeight - 5);
            let deg = this.randomNum(-30, 30);
            // Modify the coordinate origin and rotation angle
            ctx.translate(x, y);
            ctx.rotate((deg * Math.PI) / 270);
            ctx.fillText(txt, 0, 0);
            // Restore coordinate origin and rotation angle
            ctx.rotate((-deg * Math.PI) / 270);
            ctx.translate(-x, -y);
        },
        drawLine(ctx) {
            // Draw interference lines
            for (let i = 0; i < 2; i++) {
                ctx.strokeStyle = this.randomColor(
                    this.lineColorMin,
                    this.lineColorMax
                );
                ctx.beginPath();
                ctx.moveTo(
                    this.randomNum(0, this.contentWidth),
                    this.randomNum(0, this.contentHeight)
                );
                ctx.lineTo(
                    this.randomNum(0, this.contentWidth),
                    this.randomNum(0, this.contentHeight)
                );
                ctx.stroke();
            }
        },
        drawDot(ctx) {
            // Draw interference points
            for (let i = 0; i < 20; i++) {
                ctx.fillStyle = this.randomColor(0, 255);
                ctx.beginPath();
                ctx.arc(
                    this.randomNum(0, this.contentWidth),
                    this.randomNum(0, this.contentHeight),
                    1,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            }
        },
    },
    watch: {
        identifyCode: {
            deep: true,
            handler(){
                this.drawPic();
            }
        },
    },
    mounted() {
        this.drawPic();
    },
};
</script>

<style scoped>
#s-canvas {
    height: 38px;
}
</style>