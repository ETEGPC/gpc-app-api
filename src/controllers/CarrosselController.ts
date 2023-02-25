import { Notice } from "@prisma/client";
import { Request, Response } from "express";
import prismaClient from "../database/prismaClient";


export default {
  async index(req: Request, res: Response) {
    await prismaClient.$connect();

    const getNotices = prismaClient.notice.findMany({
      take: 3,
      skip: 0,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const getLastEvent = prismaClient.event.findMany({
      orderBy: {
        date: 'desc'
      },
      take: 1,
      skip: 0
    });

    const getLastNews = prismaClient.news.findMany({
      orderBy: {
        date: 'desc'
      },
      include: {
        image: true
      },
      take: 1,
      skip: 0
    });

    await prismaClient.$transaction([getNotices, getLastEvent, getLastNews]).then(resp => {
      let carrossel: any = [];

      resp[0].map(notice => {
        carrossel.push(notice);
      });

      resp[1].map(event => {
        carrossel.push(event);
      });

      resp[2].map(news => {
        carrossel.push(news);
      });

      return res.status(200).json(carrossel);
    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Houve um erro interno do servidor. Tente novamente mais tarde.'
      });
    });
  },
};