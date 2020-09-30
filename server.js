const express = require('express')

const multer = require('multer')

const execa = require('execa');

const sharp = require('sharp');

const server = express()

const storage = multer.memoryStorage()

const upload = multer({ storage: storage })

function optimize(res, buffer, type) {
    const args = [];

    if (type == 'image/png') {
        args.push('-o', '6');
        args.push('-i', '1');
        args.push('--strip', 'all');
        args.push('--stdout');
        args.push('-Z');
        args.push('-p');
        args.push('-a');
        args.push('-');

        (async() => {
            const { stdout } = await execa('oxipng', args, {
                encoding: null,
                input: buffer,
                maxBuffer: Infinity
            });
            res.end(stdout);
        })();
    }

    if (type == 'image/jpeg') {
        args.push('-quality', '80');
        args.push('-optimize');
        args.push('-progressive');
        args.push('-quant-table', '3');
        args.push('-sample', '1x1');

        (async() => {
            const { stdout } = await execa('cjpeg', args, {
                encoding: null,
                input: buffer,
                maxBuffer: Infinity
            });
            res.end(stdout);
        })();
    }
}

server.post('/', upload.any(), function(req, res) {
    let file = req.files[0];

    const width = req.body.width ? parseInt(req.body.width) : null

    const height = req.body.height ? parseInt(req.body.height) : null

    if (width || height) {
        sharp(file.buffer)
            .resize(width, height)
            .toBuffer()
            .then(data => {
                optimize(res, data, file.mimetype)
            })
            .catch(err => {
                console.log(err)
            });
    } else {
        optimize(res, file.buffer, file.mimetype)
    }
});

server.listen(8000, () => {
    console.log('Server started!')
})