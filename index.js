const PORT = 8000;
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const bp = require("body-parser");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(bp.json());
app.use(
  bp.urlencoded({
    extended: true,
  })
);

const newsUrl = "https://plantecom.klabin.com.br/-/";

app.get("/", function (req, res) {
  res.json("This is my webscraper");
});

app.post("/news-list", (req, res) => {
  axios(req.body.url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const data = {
        articles: [],
        nextPage: "",
      };

      $("#klb-plant-noticias-card-texto .plante-container", html).each(
        function () {
          const image = $(this).find(".imagem").attr("src");
          const title = $(this).find(".titulo").find("a").html();
          const unity = $(this).find(".tag-regiao").html();
          const url = $(this).find("a").attr("href");

          data.articles.push({
            image,
            title,
            unity,
            url,
          });
        }
      );

      $(".lfr-pagination-buttons li a", html).each(function () {
        console.log($(this).attr("href"));
        data.nextPage = $(this).attr("href");
      });

      res.json(data);
    })
    .catch((err) => console.log(err));
});

app.post("/the-news", (req, res) => {
  const id = req.body.id;

  axios(newsUrl + id)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const theNews = {
        title: null,
        image: null,
        unity: null,
        date: null,
        text: null,
      };

      $(".box-conteudo", html).each(function () {
        theNews.title = $(this).find(".box-textos").find(".title").html();
        theNews.text = $(this).find(".box-textos").html();
      });

      $(".noticia-detalhe-slide", html).each(function () {
        if (!theNews.image) {
          const img = $(this).find("picture").find("img").attr("src");
          theNews.image = "https://plantecom.klabin.com.br" + img;
        }
      });

      res.json(theNews);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
