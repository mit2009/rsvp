// import * as React from "react";
// import * as ReactDOM from "react-dom";
import * as $ from "jQuery";

const THRESH = 300;
const colors = ["red", "orange", "yellow", "green", "blue", "purple", "silver", "pink"];
const isRotate = ["blue"];
const colorOffset: { [key: string]: { [key: string]: number } } = {
    'red': { x: 0, y: 0 },
    'orange': { x: 0, y: 0 },
    'yellow': { x: 25, y: 19 },
    'green': { x: 0, y: 0 },
    'blue': { x: 0, y: 0 },
    'purple': { x: 0, y: 0 },
    'silver': { x: 0, y: 0 },
    'pink': { x: 0, y: 0 }
}
const mallowData: any = {}

const getDistance: any = (x1: number, y1: number, x2: number, y2: number) => {
    const deltaX = Math.abs(x2 - x1);
    const deltaY = Math.abs(y2 - y1);
    const dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    return (dist);
}

function convertStringMatrixToAngle(matrix: string) {
    console.log(`MATRIX: ${matrix}`);
    const start = matrix.indexOf('(');
    const end = matrix.indexOf(',');
    const value = matrix.substring(start + 1, end);
    const radians = Math.acos(parseFloat(value));
    const degrees = 180 * radians / Math.PI;
    return degrees;
}

for (const color of colors) {

    if ($(".mallow-" + color + ".out").length !== 0) {
        mallowData[color] = {
            out: $(".mallow-" + color + ".out").offset(),
            in: $(".mallow-" + color + ".in").offset(),
            diff: {
                top: $(".mallow-" + color + ".in").offset().top - $(".mallow-" + color + ".out").offset().top,
                left: $(".mallow-" + color + ".in").offset().left - $(".mallow-" + color + ".out").offset().left
            },
            rotateOut: convertStringMatrixToAngle($(".mallow-" + color + ".out").css("transform")),
            rotateIn: convertStringMatrixToAngle($(".mallow-" + color + ".in").css("transform")),
        };
        console.log(mallowData);

        $(".mallow-clipped-" + color).attr({
            x: mallowData[color].diff.left,
            y: mallowData[color].diff.top,
        }).css({ visibility: "visible" })
    }
}


document.addEventListener("mousemove", event => {
    const mouseLeft = event.pageX
    const mouseTop = event.pageY;
    // console.log($(".mallow-yellow.in").offset().left);
    for (const color of colors) {
        if ($(".mallow-clipped-" + color).length !== 0) {

            $('.mallow-' + color).attr("x", 30);
            $('.mallow-' + color).attr("y", 30);

            const distFromMallow = getDistance(mouseLeft, mouseTop, mallowData[color].in.left + colorOffset[color].x, mallowData[color].in.top + colorOffset[color].y)
            // console.log(color, mouseLeft - mallowData[color].in.left, mouseTop - mallowData[color].in.top);
            // console.log(distFromMallow);

            if (distFromMallow < THRESH) {
                console.log("here");

                const percentageToMallow = Math.min(1, Math.sin((distFromMallow) / THRESH * Math.PI / 2));
                // console.log((distFromMallow) / THRESH, Math.pow((distFromMallow) / THRESH, 0.25));
                $(".mallow-clipped-" + color).attr({
                    x: mallowData[color].diff.left * percentageToMallow,
                    y: mallowData[color].diff.top * percentageToMallow
                });
                if (isRotate.indexOf(color) > -1) {

                }
            } else {
                $(".mallow-clipped-" + color).attr({
                    x: mallowData[color].diff.left,
                    y: mallowData[color].diff.top
                });
                if (isRotate.indexOf(color) > -1) {

                }
            }

        }
    }
});

console.log($('.mallow-yellow'));
$('.mallow-yellow').attr({
    "x": 50,
    "y": 50
});

// export class Homepage extends React.PureComponent<{}, {}> {

//     private mouseX;
//     private mouseY;

//     public componentDidMount() {

//         document.addEventListener("mousemove", (event) => {
//             console.log("(" + event.screenX + "," + event.screenY + ")");
//             this.mouseX = event.screenX;
//             this.mouseY = event.screenY;

//             var threshold = 100;

//             var colors = ["red", "orange", "yellow", "green", "blue", "purple", "silver", "pink"];

//             var i;

//             for (i = 0; i < colors.length; i++) {
//                 var mallowXRef = this.getXCoordinate(colors[i]);
//                 var mallowYRef = this.getYCoordinate(colors[i]);

//                 var dist = this.getDistance(mallowXRef, mallowYRef, this.mouseX, this.mouseY);

//                 // if distance less than 100, move the mallow proportionately
//                 if (dist < this.threshold) {
//                     var mallowMoveX = Math.abs($(".mallow mallow-" + colors[i] + " in").left - $(".mallow mallow-" + colors[i] + " out").left);
//                     var mallowMoveY = Math.abs($(".mallow mallow-" + colors[i] + " in").top - $(".mallow mallow-" + colors[i] + " out").top);

//                     var proportion = dist / threshold;

//                     $(".mallow mallow-" + colors[i] + " out").left = proportion * mallowMoveX;
//                     $(".mallow mallow-" + colors[i] + " out").top = proportion * mallowMoveY;
//                 }

//             }

//             console.log("mallow coords: " + mallowXRef + "," + mallowYRef);
//             console.log("mouse coords: " + this.mouseX + "," + this.mouseY);

//             console.log("distance: " + dist);
//             //console.log("distance: ""+dist);
//             // your code here to check mallow distance and stuff
//             //console.log(this.getDistance(0,0,2,5));

//             //var redCoordinates = $( ".mallow mallow-red reference" ).getBoundingClientRect().top;
//             //this.getYCoordinate('red');
//             //console.log("red-mallow-x: "+this.getXCoordinate("red"));
//             //console.log("red-mallow-Y: "+this.getYCoordinate("red"));
//             //(435,427)
//         })
//     }

//     public componentWillUnmount() {

//     }

//     constructor() {
//         //console.log($(".mallow-yellow").css("backgroundColor", 'blue'));;
//     }

//     public render() {
//         return <div />
//     }

//     private getDistance(x1, y1, x2, y2) {
//         var deltaX = Math.abs(x2 - x1);
//         var deltaY = Math.abs(y2 - y1);
//         var dist = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
//         return (dist);

//         /*
//         $(".mallow-actual-yellow").css({
//           top: posX + "px",
//           left: posY + "px",
//         })
//         */
//     }

//     private getYCoordinate(mallowColor) {
//         return $("#mallow-" + mallowColor + "-reference").get(0).getBoundingClientRect().top;
//     }

//     private getXCoordinate(mallowColor) {
//         return $("#mallow-" + mallowColor + "-reference").offset().left;
//     }

// }

// ReactDOM.render(<Homepage />, document.getElementById("home-content"));