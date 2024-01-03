import fs from 'fs';
import axios from 'axios';
import { load } from 'cheerio';
import _ from 'lodash'

const TOTAL_IMAGE_DOWNLOAD = 300;
const IMAGE_DOWNLOAD_PATH = '../images/tomates-vermelhos/';


async function downloadImage(imageUrl, index) {
  const imageResponse = await axios(imageUrl, { responseType: 'stream' });
  const imageName = _.padStart((index + 1), 3, '0') + '.jpg';
  const filePath = `${IMAGE_DOWNLOAD_PATH}${imageName}`;

  imageResponse.data.pipe(fs.createWriteStream(filePath));
  console.log(`Imagem ${imageName} baixada com sucesso!`);
}

async function downloadImages(imagesToDownload, imagesDownloaded) {
  for(let index = 0; index < imagesToDownload.length; index++) {
    const imageUrl = imagesToDownload[index];
    await downloadImage(imageUrl, (imagesDownloaded + index));
  }
}

async function getImageUrls(searchTerm, pageNumber) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=isch&start=${pageNumber * 100}`;
  const response = await axios.get(url);
  const $cheerio = load(response.data);
  const imageUrls = [];

  $cheerio('img').each((index, element) => {
    const imageUrl = $cheerio(element).attr('src');
    if (imageUrl && imageUrl.startsWith('http')) {
      imageUrls.push(imageUrl);
    }
  });

  return imageUrls;
}

async function main() {
  try {
    const searchTerm = 'tomate vermelho';
    let pageNumber = 0;
    let imagesDownloaded = 0;


    while (imagesDownloaded < TOTAL_IMAGE_DOWNLOAD) {
      const imageUrls = await getImageUrls(searchTerm, pageNumber);
      const imagesOnPage = imageUrls.length;
      const remainingImages = TOTAL_IMAGE_DOWNLOAD - imagesDownloaded;
      const imagesToDownload = imageUrls.slice(0, Math.min(remainingImages, imagesOnPage));

      await downloadImages(imagesToDownload, imagesDownloaded);

      imagesDownloaded += imagesToDownload.length;
      pageNumber = pageNumber + 1;
    }
  } catch (error) {
    console.log(`Page Number: ${pageNumber}`);
    console.error('Erro ao baixar as imagens', error);
  }
}

main();