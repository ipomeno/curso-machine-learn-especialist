import _ from 'lodash';
import axios from 'axios';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const QUERY = 'tomates+verdes';
const IMAGE_COUNT = 200;
const DOWNLOAD_FOLDER = '../images/tomates-verdes/';

async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  }
  catch (error) {
    if (error.code == 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function execute() {
  try {
    const response = await axios.get(`https://pixabay.com/api/?key=${API_KEY}&q=${QUERY}&image_type=photo&per_page=${IMAGE_COUNT}&lang=pt&min_width=400&min_height=400`);

    const images = response.data.hits;
    console.log(`Encontrei ${images.length} imagens para baixar`);

    if (!await pathExists(DOWNLOAD_FOLDER)) {
      await fs.mkdir(DOWNLOAD_FOLDER);
    }

    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      const imageUrl = image.largeImageURL;
      const imageName = `${_.padStart((index+1), 3, '0')}.jpg`;
      const imagePath = `${DOWNLOAD_FOLDER}${imageName}`;
      const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });

      const imageStream = imageResponse.data;
      await fs.writeFile(imagePath, imageStream, { encoding: 'binary'});

      console.log(`Imagem ${imageName} baixada com sucesso!`);
    }
  } catch (error) {
    console.error(error);
  }
}

export { execute };