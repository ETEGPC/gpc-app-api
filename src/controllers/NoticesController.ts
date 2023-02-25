import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'yup';
import prismaClient from '../database/prismaClient';
import { noticeSchema } from '../yupSchemas/schemas';

export default {
  async create(req: Request, res: Response, next: NextFunction) {
    await prismaClient.$connect();

    const {
      title,
      description,
      schoolClass
    } = req.body;

    const notice = {
      title,
      description,
      schoolClass
    };

    await noticeSchema.validate(notice, {
      abortEarly: false
    }).then(async () => {
      await prismaClient.notice.create({
        data: notice
      }).then(() => {
        next()
        // return res.status(201).json({
        //   message: 'Aviso criado com sucesso.'
        // });
      }).catch((err) => {
        return res.status(500).json({
          message: 'Houve um erro interno do servidor.',
          errors: err
        });
      });
    }).catch((err: ValidationError) => {
      return res.status(400).json({
        message: 'Houve um erro na requisição.',
        errors: err.errors
      });
    });
  },

  async index(req: Request, res: Response) {
    await prismaClient.$connect();
    const { schoolClass } = req.query as {
      schoolClass: string
    };

    if (schoolClass) {
      await prismaClient.notice.findMany({
        where: { schoolClass }
      }).then((notices) => {
        if (notices) {
          return res.status(200).json(notices);
        };

        return res.status(400).json({
          message: 'Não foi encontrado nenhum aviso com o filtro selecionado.',
          filter: schoolClass
        });
      }).catch((err) => {
        return res.status(500).json({
          message: 'Houve um erro interno do servidor.',
          errors: err
        });
      });
    } else {
      await prismaClient.notice.findMany().then((notices) => {
        return res.status(200).json(notices);
      }).catch(err => {
        return res.status(500).json({
          message: 'Erro interno do servidor.',
          errors: err
        });
      });
    }
  },

  async show(req: Request, res: Response) {
    await prismaClient.$connect();
    const { id } = req.params;

    if (!id || id == '') {
      return res.status(400).json({
        message: 'É necessário que um id seja informado'
      });
    };

    await prismaClient.notice.findUnique({
      where: { id }
    }).then((notice) => {
      return notice ?
        res.status(200).json(notice)
        :
        res.status(400).json({
          message: 'Não foi encontrado nenhum aviso com o id recebido.'
        })
    }).catch(err => {
      return res.status(500).json({
        message: 'Houve um erro interno do servidor.',
        errors: err
      });
    });
  },

  async update(req: Request, res: Response) {
    await prismaClient.$connect();

    const { id } = req.params;
    const data = req.body;

    if (id != '') {
      await prismaClient.notice.update({
        where: { id },
        data
      }).then(() => {
        return res.status(200).json({
          message: 'Aviso atualizado com sucesso'
        });
      }).catch(err => {
        return res.status(500).json({
          message: 'Houve um erro interno do servidor.',
          errors: err
        });
      });
    };

    return res.status(400).json({
      message: 'Não foi passado o id do aviso para atualizar.'
    });
  },

  async delete(req: Request, res: Response) {
    await prismaClient.$connect();

    const { id } = req.params;

    if (!id || id == '') {
      return res.status(400).json({
        message: 'Para deletar um aviso é necessário que um id seja passado.'
      });
    };

    await prismaClient.notice.delete({
      where: { id }
    }).then(() => {
      res.status(200).json({
        message: 'Aviso deletado com sucesso.'
      });
    }).catch((err) => {
      console.error(err)
      res.status(500).json({
        message: 'Erro interno do servidor.'
      });
    });
  },
};