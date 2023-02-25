import { NextFunction, Request, response, Response } from "express";
import { ValidationError } from "yup";
import imageKit from "../config/imageKit";
import prismaClient from "../database/prismaClient";
import { newsSchema } from "../yupSchemas/schemas";

export default {
  async create(req: Request, res: Response) {
    await prismaClient.$connect();
    const data = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: 'Não é possível adicionar uma notícia se não houver uma imagem para ela.'
      });
    };

    const file = req.file;

    await newsSchema.validate(data, {
      abortEarly: false
    }).then(async () => {
      await imageKit.upload({
        file: file.buffer,
        fileName: `${file.originalname}-${Date.now()}.${file.mimetype}`,
        folder: 'news'
      }).then(async imageData => {
        const news = {
          ...data
        };

        const image = {
          imageUrl: imageData.url,
          imageId: imageData.fileId
        };

        await prismaClient.news.create({
          data: {
            image: {
              create: image
            },
            ...news,
          },
        }).then(() => {
          return res.status(200).json({
            message: 'Notícia adicionada com sucesso.'
          });
        }).catch(err => {
          console.error(err);
          return res.status(500).json({
            message: 'Houve um erro ao salvar a notícia. Tente novamente mais tarde.'
          });
        });


      }).catch(err => {
        console.error(err);
        return res.status(500).json({
          message: 'Não foi possível armazenar a imagem pois houve um erro ao salvar a imagem. Tente novamente mais tarde.'
        });
      });

    }).catch((err: ValidationError) => {
      console.error(err.errors);
      return res.status(400).json({
        message: 'Ce tem que mandar os dados certo ne caceta'
      });
    });
  },

  async index(req: Request, res: Response) {
    await prismaClient.$connect();

    await prismaClient.news.findMany({
      include: {
        image: true
      },
      orderBy: {
        date: 'desc'
      }
    }).then(news => {
      return res.status(200).json(news);
    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      });
    })
  },

  async delete(req: Request, res: Response) {
    await prismaClient.$connect();

    const { id } = req.params;
    const { imageId } = req.query as {
      imageId: string
    };

    const deleteNews = prismaClient.news.delete({
      where: { id }
    });

    const deleteImage = prismaClient.image.delete({
      where: {
        newsId: id
      }
    });

    await imageKit.deleteFile(imageId).then(async () => {
      await prismaClient.$transaction([deleteImage, deleteNews]).then(() => {
        return res.status(200).json({
          message: 'Notícia deletada com sucesso.'
        });
      }).catch(err => {
        console.error(err);
        return res.status(500).json({
          message: 'Houve um erro ao deletar a notícia. Tente novamente mais tarde.'
        });
      });


    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Não foi possível deletar a notícia pois houve um erro ao deletar a imagem.'
      })
    });
  }
};