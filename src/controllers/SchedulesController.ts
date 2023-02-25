import { Request, Response } from "express";
import { ValidationError } from "yup";
import imageKit from "../config/imageKit";
import prismaClient from "../database/prismaClient";
import { scheduleSchema } from "../yupSchemas/schemas";

export default {
  async create(req: Request, res: Response) {
    await prismaClient.$connect();

    const {
      schoolClass
    } = req.body;

    const data = {
      schoolClass
    };

    await scheduleSchema.validate(data, {
      abortEarly: false
    }).then(async () => {
      if (!req.file) {
        return res.status(400).json({
          message: 'Não foi enviado nenhum pdf para armazenar.'
        });
      };

      await imageKit.upload({
        file: req.file.buffer,
        fileName: `${Date.now()}-${schoolClass}.pdf`,
        folder: 'horarios',
        useUniqueFileName: false
      }).then(async resp => {
        const schedule = {
          ...data,
          url: resp.url,
          fileId: resp.fileId
        };

        await prismaClient.schedules.create({
          data: schedule
        }).then(() => {
          return res.status(201).json({
            message: 'Horário adicionado com sucesso.'
          });
        }).catch(err => {
          console.error(err);
          return res.status(500).json({
            message: 'Houve um erro interno do servidor.',
            errors: err
          });
        })
      });

    }).catch((err: ValidationError) => {
      return res.status(400).json({
        message: 'Houve erros na validação.',
        errors: err.errors
      });
    });
  },

  async show(req: Request, res: Response) {
    await prismaClient.$connect();

    const {
      schoolClass
    } = req.params;

    await prismaClient.schedules.findUnique({
      where: {
        schoolClass
      }
    }).then(resp => {
      return res.status(200).json(resp);
    }).catch(err => {
      return res.status(500).json({
        message: 'Houve um erro ao buscar o link do horário da turma.',
        errors: err
      });
    });
  },

  async update(req: Request, res: Response) {
    await prismaClient.$connect();

    const { schoolClass } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: 'Não foi recebido nenhum arquivo para atualizar o horário.'
      });
    };

    const file = req.file;

    await prismaClient.schedules.findUnique({
      where: { schoolClass }
    }).then(async (schedule) => {
      if (schedule) {
        await imageKit.deleteFile(schedule.fileId).then(async () => {
          await imageKit.upload({
            fileName: `${Date.now()}-${schoolClass}.pdf`,
            file: file.buffer,
            folder: 'horarios',
            useUniqueFileName: false
          }).then(async resp => {
            const updatedData = {
              fileId: resp.fileId,
              url: resp.url
            };

            await prismaClient.schedules.update({
              where: { schoolClass },
              data: updatedData
            }).then(() => {
              return res.status(200).json({
                message: 'Arquivo atualizado com sucesso.'
              });
            }).catch(err => {
              console.error(err);
              return res.status(500).json({
                message: 'Houve um erro ao atualizar o horário.',
                errors: err
              });
            });

          }).catch(err => {
            console.error(err);
            return res.status(500).json({
              message: 'Houve um erro ao atualizar o horário.',
              errors: err
            });
          });

        }).catch(err => {
          console.error(err);
          return res.status(500).json({
            message: 'Houve um erro ao atualizar o horário.',
            errors: err
          });
        });
      }

    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Houve um erro ao atualizar o horário.',
        errors: err
      });
    });
  },
};