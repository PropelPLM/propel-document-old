const hummus = require('hummus');
const pathToFont = __dirname.substring(process.cwd().length + 1) + '/LiberationSans.ttf'

const main = (rules, pdfTempName) => {
  try {
    //https://github.com/galkahana/HummusJS/wiki/How-to-serve-dynamically-created-pdf
    //https://github.com/galkahana/HummusJS/issues/103
    const pdfWriter = hummus.createWriterToModify(pdfTempName);
    const pdfReader = hummus.createReader(pdfTempName)
    const pageCount = pdfReader.getPagesCount();
    const font = pdfWriter.getFontForFile(pathToFont, 0);

    const radians = 45 / 180 * Math.PI // hard coded 45 degrees
    const pageDimensions = pdfReader.parsePage(0).getMediaBox()
    const pageWidth = pageDimensions[2]
    const smallestPageWidth = pageWidth * 0.6 // hard coded 60% of page width
    let l = 0, r = 96, fontSize; // max font size set to 96
    let textDimensions, widthRotated, widthAdjust, widthTotal;

    while (l <= r) {
      if (Math.abs((l + r) / 2 - fontSize) < 1) {
        break;
      }
      fontSize = (l + r) / 2;
      textDimensions = font.calculateTextDimensions(rules.watermarkText, fontSize);
      widthRotated = textDimensions.width * Math.cos(radians);
      widthAdjust = textDimensions.height * Math.sin(radians);
      widthTotal = widthRotated + widthAdjust;
      if (widthTotal > pageWidth || widthAdjust > 60) { // text runs off border
        r = fontSize;
      } else if (widthTotal < smallestPageWidth) { // text too small
        l = fontSize;
      } else {
        break;
      }
    }

    const {
      watermarkText,
      watermarkColor: color = [0, 0, 0],
      watermarkAngle: angle = 45,
      watermarkOpacity: opacity = 0.2
    } = rules

    let watermarkXObj;
    if (watermarkText) {
      watermarkXObj = getWatermarkXObject(pdfWriter, watermarkText, color, fontSize, angle, opacity)
    }

    for (let i = 0; i < pageCount; i++) {
      let pageModifier = new hummus.PDFPageModifier(pdfWriter, i, true);

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
          writeOnPage(Object.assign({}, { position: r, text: rules[r] }, { pageModifier, pdfWriter, mediaBox }));
        }
      }

      if (watermarkXObj) {
        watermarkPage(watermarkText, fontSize, angle, pdfWriter, pageModifier, mediaBox, watermarkXObj)
      }

    }
    pdfWriter.end();
  } catch (e) {
    console.error(e.stack)
  }

}

function writeOnPage({ text, size = 10, leftMargin = 70, position, pageModifier, pdfWriter, mediaBox }) {
  if (!text) { return; }
  let context = pageModifier.startContext().getContext()

  let font = pdfWriter.getFontForFile(pathToFont, 0);
  let textDimensions = font.calculateTextDimensions(text, size);

  const [pageXOffset, pageYOffset, pageWidth, /*pageHeight*/] = mediaBox;
  const oneThirdWidth = (pageWidth - leftMargin) / 3
  let lines = text.split('\n');
  let numOfLines = lines.length;
  let rowHeight = textDimensions.height;
  let textBoxHeight = Math.round(numOfLines * rowHeight * 1000) / 1000;
  let yTransform = 0
  let xTransform = 0
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

  for (let i = 0; i < lines.length; i++) {
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
  let radians = degrees / 180 * Math.PI //must be in radians
  context.cm(Math.cos(radians), Math.sin(radians), -Math.sin(radians), Math.cos(radians), 0, 0)

}

function getPageCount(pdfTempName) {
  let pdfReader = hummus.createReader(pdfTempName)
  return pdfReader.getPagesCount()
}

function appendPage(masterFileName, secondFileName) {
  let pdfWriter = hummus.createWriterToModify(masterFileName);
  pdfWriter.appendPDFPagesFromPDF(secondFileName)
  pdfWriter.end();
}

function getWatermarkXObject(pdfWriter, text, color, fontsize, degrees, opacity) {
  /* CREATING THE TRANSPARENCY OBJECT */
  let objCxt = pdfWriter.getObjectsContext();
  let gsId = objCxt.startNewIndirectObject();
  let dict = objCxt.startDictionary()
  dict.writeKey("type");
  dict.writeNameValue("ExtGState");
  // #242: Change from CA to ca
  dict.writeKey("ca");
  objCxt.writeNumber(opacity); // this is the opacity
  objCxt.endLine();
  objCxt.endDictionary(dict);

  // #242: Use xObjectForm
  let xObject = pdfWriter.createFormXObject(
    0, //x
    0, //y
    2000, //width
    1000 //height
  );
  let resourcesDict = xObject.getResourcesDictinary(); // This is not a typo =~=
  let gsName = resourcesDict.addExtGStateMapping(gsId);
  let font = pdfWriter.getFontForFile(pathToFont, 0);

  let context = xObject.getContentContext()
    .q()
    .gs(gsName)
    .BT() // Begin Text
    //.k(1, 1, 1, 1) // Set Color (CMYK, 0-1)
    .rg(color[0], color[1], color[2]) // Set Color (RGB, 0-1)
    .Tf(font, fontsize) // Font & size
    .Tm(1, 0, 0, 1,
      60, //xTranslate
      0 //yTranslate
    ) // Text Matrix

  rotateContext(context, degrees)
  context
    .Tj(text) // Show text
    .ET() // End Text
    .Q();

  rotateContext(context, 45)
  pdfWriter.endFormXObject(xObject);
  return xObject;
}

function watermarkPage(text, fontsize, angle, pdfWriter, pageModifier, mediaBox, xObject) {
  const pageWidth = mediaBox[2], pageHeight = mediaBox[3]
  let context = pageModifier.startContext().getContext();
  let font = pdfWriter.getFontForFile(pathToFont, 0);
  let textDimensions = font.calculateTextDimensions(text, fontsize);

  let radians = angle / 180 * Math.PI //must be in radians
  let widthRotated = textDimensions.width * Math.cos(radians);
  let heightRotated = textDimensions.width * Math.sin(radians);
  let widthAdjust = textDimensions.height * Math.sin(radians);
  let heightAdjust = textDimensions.height * Math.cos(radians);

  let widthTotal = widthRotated + widthAdjust;
  let heightTotal = heightRotated + heightAdjust;
  let xAdjust = (pageWidth - widthTotal) / 2 - 30;
  let yAdjust = (pageHeight - heightTotal) / 2 - heightAdjust / 2;

  context
    .q()
    .cm(1, 0, 0, 1,
      xAdjust, //x
      yAdjust //y
    ) // Set Current Matrix - scale to 100% (x and y), translate 0,35
    // #242 add xobject
    .doXObject(xObject)
    .Q()

  pageModifier.endContext().writePage();

}

module.exports = {
  main,
  getPageCount,
  appendPage,
}
