var express = require('express');
var app = express();

// define the public directory for static assets
var public_dir = __dirname + '/public';

// setup express
app.use(express.compress());
app.use(express.static(public_dir));
app.use(express.json());
app.use(express.urlencoded());

// setup jade
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

// route: get: /
app.get('/', function (req, res) {
  res.render('index',
    { title : 'NodeJS PhantomJS Screenshot' }
  )
});

// route: post: /process_url
app.post('/process_url', function (req, res) {

  // get url to process
  var url_to_process = req.body.url;
  if (url_to_process === undefined || url_to_process == '') {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end("404 Not Found");
  }

  // phantomjs screenshot
  var phantom = require('phantom');
  phantom.create(function(ph){
    ph.createPage(function(page){
      page.open(url_to_process, function(status){
        if (status == "success") {
          // put images in public directory
          var image_file_name = url_to_process.replace(/\W/g, '_') + ".png"
          var image_path = public_dir + "/" + image_file_name
          page.render(image_path, function(){
            // redirect to static image
            res.redirect('/'+image_file_name);
          });
        }
        else {
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.end("404 Not Found");
        }
        page.close();
        ph.exit();
      });
    });
  });

});

// start server
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
