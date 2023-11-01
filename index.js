require('dotenv').config();
const express = require('express');
const cors = require('cors');
const DNS = require('dns');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let urls = [];

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function (req, res) {
  const { url } = req.body
  console.log(url)
  if (url === "") {
    return res.json(
      {
        "error": "invalid url"
      }
    );
  }
  const parsedUrl = new URL(url);

  DNS.lookup(parsedUrl.hostname, (err, address, family) => {
    if (err) {
      return res.json(
        {
          "error": "invalid url"
        }
      );
    }
    const existingUrl = urls.find(url => url.original_url === parsedUrl.href); 
    if (existingUrl) {
      return res.json(
        {
          "original_url": existingUrl.original_url,
          "short_url": existingUrl.short_url
        }
      );
    } else {
      const short_url = urls.length + 1;
      urls.push({ original_url: parsedUrl.href, short_url });
      return res.json(
        {
          "original_url": parsedUrl.href,
          short_url 
        }
      );
    };
  });
});

app.get('/api/shorturl/:id', (req, res) => {
  const { id } = req.params;
  const short_link = urls.find(sl => sl.short_url == id);
  if (short_link) {
    console.log(short_link)
    res.setHeader('Location', short_link.original_url);
    res.statusCode = 302;
    res.end();
  }
  else {
    return res.status(400).json(
      {
        "error": "invalid URL"
      }
    );
  }
});

app.get('/api/shorturls/', (req, res) => {
  return res.json(urls)
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});