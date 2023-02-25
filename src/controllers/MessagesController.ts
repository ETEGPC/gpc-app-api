import { Request, Response } from "express";
import prismaClient from "../database/prismaClient";

export default {
  async index(req: Request, res: Response) {
    await prismaClient.$connect();
    const { room } = req.query;

    if (!room || room == '') {
      return res.status(400).json({
        message: 'Não foi selecionado uma conversa para buscar as mensagens anteriores'
      });
    }; 

    await prismaClient.message.findMany({
      where: {
        room: String(room)
      },
      orderBy: {
        createdAt: 'asc'
      }
    }).then(messages => {
      return res.status(200).json(messages);
    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Erro interno do servidor.',
        errors: err
      });
    });
  }
};