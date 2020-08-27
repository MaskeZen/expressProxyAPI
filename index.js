const express = require('express')
const cors = require('cors')
const app = express()
const port = 4000
const http = require('http');

const REMOTE_BASE_URL = 'http://localhost:8080' // Sin barra al final
const REMOTE_API_PREFIX = '*' // prefijo API del servidor se puede sustituir por *

app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.send('Proxy APP ROOT')
})

app.get(`/${REMOTE_API_PREFIX}/*`, (req, res) => {
    try {
        callRemote(
            req.path, 
            err => res.status(500).json(err),
            result => res.json(result),
        )
    } catch (e) {
        console.error(e)
        res.status(500).json('error')
    }
})

let callRemote = (path, error, success) => {
    http.get(REMOTE_BASE_URL + path, (response) => {
        let result = '';
        // se llama cuando se recibe un trozo (chunk) de datos.
        response.on('data', (chunk) => {
            result += chunk;
        });
        // se llama cuando se completa de recibir el response.
        response.on('end', () => {
            try {
                let resultJson = JSON.parse(result)
                success(resultJson)
            } catch (e) {
                error({ error: 'Error al realizar la solicitud' })
            }
            
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
        error(err)
    });
}

app.listen(port, () => {
  console.log(`API Proxy corriendo en http://localhost:${port}`)
})