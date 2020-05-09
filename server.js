const express = require('express')

const multer = require('multer')

const execa = require('execa');

const server = express()

const storage = multer.memoryStorage()

const upload = multer({ storage: storage })

server.post('/', upload.any(), function(req, res) {
    let file = req.files[0];

    const args = [];

    if (file.mimetype == 'image/jpeg') {
        args.push('-quality', '80');
        args.push('-optimize');
        args.push('-progressive');
        args.push('-quant-table', '3');
        args.push('-sample', '1x1');

        (async() => {
            const { stdout } = await execa('cjpeg', args, {
                encoding: null,
                input: file.buffer,
                maxBuffer: Infinity
            });
            res.end(stdout);
        })();
    }

    if (file.mimetype == 'image/png') {
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
                input: file.buffer,
                maxBuffer: Infinity
            });
            res.end(stdout);
        })();
    }
});

server.listen(8000, () => {
    console.log('Server started!')
})