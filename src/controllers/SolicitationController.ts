import { NextFunction, Request, Response } from "express";
import { ValidationError } from "yup";
import prismaClient from "../database/prismaClient";
import { solicitationSchema } from "../yupSchemas/schemas";

export default {
  async create(req: Request, res: Response, next: NextFunction) {
    await prismaClient.$connect();

    const data = req.body;

    const solicitation = {
      ...data
    };

    await solicitationSchema.validate(solicitation, {
      abortEarly: false
    }).then(async () => {
      await prismaClient.solicitation.create({
        data: solicitation
      }).then(() => {
        next();
        // return res.status(200).json({
        //   message: 'Solicitação criada com sucesso.'
        // });
      }).catch((err) => {
        console.error(err)
        return res.status(500).json({
          message: 'Houve um erro ao criar sua solicitação.'
        });
      });
    }).catch((err: ValidationError) => {
      console.error(err.errors)
      res.status(400).json({
        message: 'Houve um erro ao validar os campos.',
        errors: err
      });
    });
  },

  async index(req: Request, res: Response) {
    await prismaClient.$connect();

    const { type } = req.query;

    if (!type || type == '') {
      return res.status(400).json({
        message: 'Não foi informado o tipo de solicitação que está sendo buscada.'
      });
    }

    await prismaClient.solicitation.findMany({
      where: { type: String(type) }
    }).then((solicitations) => {
      return res.status(200).json(solicitations);
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({
        message: 'Houve um erro interno do servidor.',
        errors: err
      });
    });
  },

  async update(req: Request, res: Response) {
    await prismaClient.$connect();

    const { id } = req.params;
    const { status, finishedAt } = req.body;

    if (!status || status == '') {
      return res.status(400).json({
        message: 'Não foi informado o status para ser alterado.'
      });
    }

    if (!id || id == '') {
      return res.status(400).json({
        message: 'Não foi informado o id da solicitação para alterá-la.'
      });
    }

    await prismaClient.solicitation.update({
      where: { id },
      data: {
        status,
        finishedAt
      }
    }).then(() => {
      return res.status(200).json({
        message: 'Status da solicitação alterado com sucesso.'
      });
    }).catch((err) => {
      console.error(err);
      return res.status(500).json({
        message: 'Houve um erro interno do servidor.',
        errors: err
      });
    });
  },

  async delete(req: Request, res: Response) {
    await prismaClient.$connect();

    const { id } = req.params;

    if (!id || id == '') {
      return res.status(400).json({
        message: 'Não é possível excluir uma solicitação sem que o id dela seja informado.'
      });
    };

    await prismaClient.solicitation.delete({
      where: { id }
    }).then(() => {
      return res.status(200).json({
        message: 'Solicitação deletada com sucesso.'
      })
    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Houve um erro interno do servidor.',
        errors: err
      });
    });
  },

  async list(req: Request, res: Response) {
    await prismaClient.$connect();

    const { parentId } = req.params;

    if (!parentId || parentId === '') {
      return res.status(400).json({
        message: 'Não foi recebido um id válido para buscar as solicitações.'
      });
    };

    await prismaClient.solicitation.findMany({
      where: {
        parentId 
      }
    }).then(solicitations => {
      return res.status(200).json(solicitations);
    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Houve um erro interno do servidor. Tente novamente mais tarde.'
      });
    })
  }
};