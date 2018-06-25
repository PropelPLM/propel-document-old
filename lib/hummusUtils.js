var hummus = require('hummus');
// var outPath = '/Users/ryan/Desktop/testmod.pdf';

function main(rules, randomFileName, cb) {

  console.log('== hummus file== ' + randomFileName);

  try {
    //https://github.com/galkahana/HummusJS/wiki/How-to-serve-dynamically-created-pdf
    //https://github.com/galkahana/HummusJS/issues/103
    var pdfWriter = hummus.createWriterToModify(randomFileName);
    var pdfReader = hummus.createReader(randomFileName)
    var pageCount = pdfReader.getPagesCount();

    for (var i = 0; i < pageCount; i++) {
      var pageModifier = new hummus.PDFPageModifier(pdfWriter, i, true);

      //https://github.com/galkahana/HummusJS/issues/192
      const mediaBox = pdfReader.parsePage(i).getMediaBox()

      // TODO
      // for (let rule of rules) {
      //   writeOnPage(Object.assign({}, rule, { pageModifier, pdfWriter, mediaBox }));
      // }
      // TODO
      const baseRules = ['footerCenterText', 'footerLeftText', 'footerRightText', 'leftText', 'rightText']
      for (let r of baseRules) {
        if (rules[r] != null) {
          writeOnPage(Object.assign({}, { position: r, text: rules[r]}, { pageModifier, pdfWriter, mediaBox }));
        }
      }


      // watermarkPage(context, pdfWriter)

    }
    pdfWriter.end();
    cb()
  } catch(e) {
    cb(e)
  }

}

function writeOnPage({text, size=10, leftMargin=70, position, pageModifier, pdfWriter, mediaBox}) {
  if (!text) { return; }
  var context = pageModifier.startContext().getContext()

  var font = pdfWriter.getFontForFile('./lib/LiberationSans.ttf',0);
  var textDimensions = font.calculateTextDimensions(text, size);

  const [pageXOffset, pageYOffset, pageWidth, /*pageHeight*/] = mediaBox;
  const oneThirdWidth = (pageWidth - leftMargin)  / 3
  let lines = text.split('\n');
  let numOfLines = lines.length;
  let rowHeight = textDimensions.height;
  let textBoxHeight = Math.round(numOfLines * rowHeight * 1000) / 1000;
  var yTransform = 0
  var xTransform = 0
  if (position == 'footerLeftText') {
    yTransform = textBoxHeight;
  } else if (position == 'footerCenterText') {
    yTransform = textBoxHeight;
    xTransform = oneThirdWidth;
  } else if (position == 'footerRightText') {
    yTransform = textBoxHeight;
    xTransform = 2 * oneThirdWidth;

  // TODO
  // } else if (position == 'top') {
  //   yTransform = pageHeight - rowHeight;
  } else if (position == 'rightText') {
    rotateContext(context, 90)
    yTransform = -(pageWidth - textBoxHeight);
  } else if (position == 'leftText') {
    rotateContext(context, 90)
    yTransform = -rowHeight;
  }

  for (let i = 0; i < lines.length; i++ ) {
    let line = lines[i]
    context.writeText(
      line,
      pageXOffset + xTransform + leftMargin,
      pageYOffset + yTransform - (i * textDimensions.height),
      {
        font,
        size,
        colorspace: 'black',
        color: 0x00
      }
    );
  }

  pageModifier.endContext().writePage();
}

function rotateContext(context, degrees) {
  // https://github.com/galkahana/HummusJS/issues/59
  //rotate context of writeText
  var radians = degrees / 180 * Math.PI //must be in radians
  context.cm(Math.cos(radians), Math.sin(radians), -Math.sin(radians), Math.cos(radians),0,0)

}

function getPageCount(randomFileName) {
  let pdfReader = hummus.createReader(randomFileName)
  return pdfReader.getPagesCount()
}

function appendPage(masterFileName, secondFileName) {
  var pdfWriter = hummus.createWriterToModify(masterFileName);
  pdfWriter.appendPDFPagesFromPDF(secondFileName)
  pdfWriter.end();
}

// function watermarkPage(context, pdfWriter) {
//   //TODO: calc watermark position/rotation pased on height/width, font size if we decide to watermark with hummus
//
//   rotateContext(context, 55)
//   context.writeText(
//     'Uncontrolled Copy',
//     100, // x transform
//     -10, // y transform
//     {
//       font: pdfWriter.getFontForFile('/Users/ryan/Desktop/Couri.ttf',0),
//       size: 80,
//       colorspace: 'gray',
//       color: 0x00
//     }
//   );
// }
module.exports = { main, getPageCount, appendPage }
