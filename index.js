const inquirer = require('inquirer');
const axios = require('axios');
const fs = require('fs');
const process = require('process');
const path = require('path');
const { PDFDocument } = require("pdf-lib");

const questions = [
   {
      type: 'input',
      name: 'filename',
      message: "Please input name for file.",
   },
   {
      type: 'number',
      name: 'width',
      message: "Please input image width.",
   },
   {
      type: 'input',
      name: 'imgUrl',
      message: "Please input url for image.",
   },
   {
      type: 'input',
      name: 'cookie',
      message: "Please input chrome cookie.",
   }
];

inquirer.prompt(questions).then(async answers => {
   const url = new URL(answers.imgUrl);
   try {
      let pageCnt = 0;
      url.searchParams.set('w', answers.width);
      url.searchParams.set('webp', false);
      const doc = await PDFDocument.create();
      while (pageCnt < 100) {
         try {
            url.searchParams.set('page', pageCnt);
            const res = await axios.get(url.toString(), {
               responseType: 'arraybuffer',
               headers: {
                  Cookie: answers.cookie
               }
            });
            pageCnt++;

            const image = await doc.embedPng(`data:image/png;base64,${Buffer.from(res.data, 'binary').toString('base64')}`);
            const page = doc.addPage([image.width, image.height]);
            page.drawImage(image, {
               x: 0,
               y: 0,
               width: image.width,
               height: image.height,
            });
         } catch (e) {
            break;
         }
      }
      fs.writeFileSync(`${process.env.USERPROFILE}${path.sep}Downloads${path.sep}${answers.filename}`, await doc.save());
   } catch (e) {
      console.log(e.message ?? e);
   }
});
