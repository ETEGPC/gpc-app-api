import { Request, Response } from "express";
import { eventSchema } from "../yupSchemas/schemas";
import prismaClient from "../database/prismaClient";
import { ValidationError } from "yup";

export default {
  async create(req: Request, res: Response) {
    await prismaClient.$connect();

    const {
      title,
      description,
      date
    } = req.body;

    const event = {
      title,
      description,
      date
    }

    // 2023-10-20T10:22:33.22+03:00

    await eventSchema.validate(event, {
      abortEarly: false
    }).then(async () => {
      await prismaClient.event.create({
        data: event
      }).then(() => {
        res.status(201).json({
          message: 'Evento adicionado com sucesso.'
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
    const { month, year } = req.query;

    if (!month || month == '') {
      return res.status(400).json({
        message: 'Não foi passado o mês para mostrar os eventos.'
      });
    };

    if (!year || year == '') {
      return res.status(400).json({
        message: 'Não foi passado o ano para listar os eventos.'
      });
    };

    await prismaClient.event.findMany({
      where: {
        date: {
          lte: new Date(`${year}-${month}-31`).toISOString(), // LTE: Less Than or Equal to
          gte: new Date(`${year}-${month}-01`).toISOString() // GTE: Greater Than or Equal to
        },
      },
      orderBy: {
        date: 'asc'
      }
    }).then((events) => {
      if (!events) {
        return res.status(400).json({
          message: 'Não foi encontrado nenhum evento com o filtro escolhido'
        });
      }

      return res.status(200).json(events);
    }).catch(err => {
      return res.status(500).json({
        message: 'Houve um erro interno do servidor.',
        errors: err
      });
    });
  },

  async show(req: Request, res: Response) {
    await prismaClient.$connect();

    const { id } = req.params;

    if (!id || id == '') {
      return res.status(400).json({
        message: 'É necessário que um id seja informado'
      });
    };

    await prismaClient.event.findUnique({
      where: { id }
    }).then((event) => {
      return event ?
      res.status(200).json(event)
      :
      res.status(400).json({
        message: 'Não foi encontrado nenhum evento com o id recebido.'
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

    if (!id || id == '') {
      return res.status(400).json({
        message: 'Não foi passado o id do aviso para atualizar.'
      });
    };

    await prismaClient.event.update({
      where: { id },
      data
    }).then(() => {
      return res.status(200).json({
        message: 'Evento atualizado com sucesso'
      });
    }).catch(err => {
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
        message: 'Não foi informado o id do evento que você deseja deletar.'
      });
    };

    await prismaClient.event.delete({
      where: { id }
    }).then(() => {
      return res.status(200).json({
        message: 'Evento deletado com sucesso.'
      });
    }).catch(err => {
      return res.status(500).json({
        message: 'Houve um erro interno do servidor.',
        errors: err
      });
    })
  },
};