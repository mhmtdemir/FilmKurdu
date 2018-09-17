const express = require('express');
const app = express();

var http = require('http').Server(app);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const io=require('socket.io')(http);

app.use(express.static(__dirname+'/client'));
app.use(bodyParser.json());

Genre =require('./models/genre');
Book =require('./models/book');

// Connect to Mongoose
mongoose.connect('mongodb://localhost/bookstore');
var db = mongoose.connection;

app.get('./', function(req, res){
    res.sendFile(__dirname + '/chatbox.html');
});
var yorumlar=mongoose.Schema(

    {
        film:String,
        yorumyapan: String,
        yorum:String,
        zaman:{type: Date,default:Date.now()}

    }
);
var yoruumDb=mongoose.model('Yorum',yorumlar);
//BAGLANTIYI ACIYORUM
io.on('connection',function (socket) {

    //ŞİMDİ SOCKET ACICAM







    socket.on('mesajim', function (msg, callback) {

        if (msg == "") {
            callback("MESAJ GİRİN");

        }
        else {
            var date = new Date();
            var now = date.getFullYear() + ":0" + date.getMonth() + ":0" + date.getDay();
            var current_hour = date.getHours();
            var current_second = date.getMinutes();
            var time = current_hour + ":" + current_second;
            io.emit('mesajyayinla', {msg: msg, date: time, tarih: now});
            console.log('MESAJ  ' + msg);
        }

    });

    socket.on('yorum', function (film, isim, yorum) {

        var yorum3= new yoruumDb({film:film, yorumyapan:isim, yorum:yorum});
        yorum3.save(function (err) {
            if (err) throw err;
            var date = new Date();
            var now = date.getFullYear() + ":0" + date.getMonth() + ":0" + date.getDay()+" "+date.getHours()+":" +date.getMinutes();
            io.emit('yorumyayinla', {film:film, yorumyapan: isim, yorum: yorum,date:now});
            console.log("film  " + film +  "  yorumcu   " + isim + " yorum   " + yorum);

        });

    });

    socket.on('eskiyorumlar',function (film,callback) {

        var query2=yoruumDb.find({film:film});
        query2.exec(function (err,docs) {

            if(err) throw err;
            else if(docs.length==0){
                callback("BU FİLME HENÜZ YORUM YAPİLMAMİŞ");
            }
            else {
                console.log('eski yorumlar yuklendi:'+docs);
                //socket.to(msg).emit('ozelmesaj',docs);
                io.emit('eskiyorumlariyayinla',docs);
            }
        });

    });

});

    app.get('/', (req, res) => {
        res.send('Please use /api/books or /api/genres');
    });

    app.get('/api/genres', (req, res) => {
        Genre.getGenres((err, genres) => {
            if (err) {
                throw err;
            }
            res.json(genres);
        });
    });

    app.post('/api/genres', (req, res) => {
        var genre = req.body;
        Genre.addGenre(genre, (err, genre) => {
            if (err) {
                throw err;
            }
            res.json(genre);
        });
    });

    app.put('/api/genres/:_id', (req, res) => {
        var id = req.params._id;
        var genre = req.body;
        Genre.updateGenre(id, genre, {}, (err, genre) => {
            if (err) {
                throw err;
            }
            res.json(genre);
        });
    });

    app.delete('/api/genres/:_id', (req, res) => {
        var id = req.params._id;
        Genre.removeGenre(id, (err, genre) => {
            if (err) {
                throw err;
            }
            res.json(genre);
        });
    });

    app.get('/api/books', (req, res) => {
        Book.getBooks((err, books) => {
            if (err) {
                throw err;
            }
            res.json(books);
        });
    });

    app.get('/api/books/:_id', (req, res) => {
        Book.getBookById(req.params._id, (err, book) => {
            if (err) {
                throw err;
            }
            res.json(book);
        });
    });

    app.post('/api/books', (req, res) => {
        var book = req.body;
        Book.addBook(book, (err, book) => {
            if (err) {
                throw err;
            }
            res.json(book);
        });
    });

    app.put('/api/books/:_id', (req, res) => {
        var id = req.params._id;
        var book = req.body;
        Book.updateBook(id, book, {}, (err, book) => {
            if (err) {
                throw err;
            }
            res.json(book);
        });
    });

    app.delete('/api/books/:_id', (req, res) => {
        var id = req.params._id;
        Book.removeBook(id, (err, book) => {
            if (err) {
                throw err;
            }
            res.json(book);
        });
    });

    http.listen(3000);
    console.log('Running on port 3000...');

