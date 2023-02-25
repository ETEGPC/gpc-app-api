import ImageKit from "imagekit";

const imageKit = new ImageKit({
  privateKey: `${process.env.IMAGEKIT_PRIVATE_KEY}`,
  publicKey: `${process.env.IMAGEKIT_PUBLIC_KEY}`,
  urlEndpoint: `${process.env.IMAGEKIT_URL_ENDPOINT}`,
});

export default imageKit;