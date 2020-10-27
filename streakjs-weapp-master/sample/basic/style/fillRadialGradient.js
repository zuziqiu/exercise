const streakjs = require('../../../lib/streakjs/streakjs.min');

export function runDraw(layer) {

    var text = new streakjs.shapes.Text({
        x: (layer.width - 240) / 2,
        y: 100,
        text: "streakjs",
        fontSize: 32,
        fill: 'white',
        width: 240,
        padding: 20,
        align: 'center'
    });

    var rect = new streakjs.shapes.Rect({
        x: (layer.width - 240) / 2,
        y: 100,
        width: 240,
        height: 80,
        fillRadialGradientStartPoint: { x: 120, y: 40 },
        fillRadialGradientStartRadius: 40,
        fillRadialGradientEndPoint: { x: 120, y: 40 },
        fillRadialGradientEndRadius: 120,
        fillRadialGradientColorStops: [0, 'blue', 1, 'green']
    });

    layer.add(rect);
    layer.add(text);


    layer.draw();

}