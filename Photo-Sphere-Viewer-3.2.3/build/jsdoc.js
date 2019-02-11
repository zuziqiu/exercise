(function() {
    var header = $('.page-header');
    var pattern = Trianglify({
        width: window.screen.width | header.outerWidth(),
        height: header.outerHeight(),
        cell_size: 90,
        seed: 'Photo Sphere Viewer',
        x_colors: ['#09B4E9', '#15884C']
    });

    header.css('background-image', 'url(' + pattern.png() + ')');
}());
