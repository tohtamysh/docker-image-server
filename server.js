const express = require('express');

const multer = require('multer');

const execa = require('execa');

const sharp = require('sharp');

const server = express();

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

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

        (async () => {
            const { stdout } = await execa('oxipng', args, {
                encoding: null,
                input: buffer,
                maxBuffer: Infinity
            });
            res.end(stdout);
        })();
    }

    if (type == 'image/jpeg') {
        args.push('-quality', '90');
        args.push('-optimize');
        args.push('-progressive');
        args.push('-quant-table', '3');
        args.push('-sample', '1x1');

        (async () => {
            const { stdout } = await execa('cjpeg', args, {
                encoding: null,
                input: buffer,
                maxBuffer: Infinity
            });
            res.end(stdout);
        })();
    }
}

server.post('/', upload.fields([{ name: 'image' }, { name: 'watermark' }]), function (req, res) {
    let image_file = req.files['image'];

    let watermark = req.files['watermark'];

    const width = req.body.width ? parseInt(req.body.width) : null;

    const height = req.body.height ? parseInt(req.body.height) : null;

    sharp(image_file[0].buffer)
        .metadata()
        .then(imageMeta => {
            if (typeof watermark !== 'undefined') {
                sharp(watermark[0].buffer)
                    .resize(Math.round(imageMeta.width / (req.body.factor ? parseInt(req.body.factor) : 10)))
                    .toBuffer()
                    .then(dataWatermark => {
                        sharp(dataWatermark)
                            .metadata()
                            .then(watermarkMeta => {
                                sharp(image_file[0].buffer)
                                    .resize(width, height)
                                    .composite([
                                        {
                                            input: dataWatermark,
                                            top: imageMeta.height - watermarkMeta.height - (req.body.padding ? parseInt(req.body.padding) : 15),
                                            left: imageMeta.width - watermarkMeta.width - (req.body.padding ? parseInt(req.body.padding) : 15)
                                        }
                                    ])
                                    .toBuffer()
                                    .then(data => {
                                        optimize(res, data, image_file[0].mimetype);
                                    });
                            })
                    });
            } else {
                sharp(image_file[0].buffer)
                    .resize(width, height)
                    .toBuffer()
                    .then(data => {
                        optimize(res, data, image_file[0].mimetype);
                    });
            }
        });
});

server.listen(8000, () => {
    console.log('Server started!')
})