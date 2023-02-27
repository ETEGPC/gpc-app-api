import { Request, Response } from "express";
import webpush from 'web-push';
import { ISubscription } from "../@types/interfaces";
import prismaClient from "../database/prismaClient";
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

webpush.setVapidDetails(
  `${process.env.PUSH_NOTIFICATION_URL}`,
  'BKqNcUViP-4xKjL6_Smp3vRTUQWjTByIABcKpRO-Ho6zaHVBDS0qBfCLlxyWUT_a0QslPrbHO5WNF8yDVdkpKEw',
  `${process.env.PUSH_NOTIFICATION_PRIVATE_KEY}`
);

let expo = new Expo();

export default {
  async sendPublicKey(req: Request, res: Response) {
    res.status(200).json({
      publicKey: `${process.env.PUSH_NOTIFICATION_PUBLIC_KEY}`
    })
  },

  async registerParent(req: Request, res: Response) {
    await prismaClient.$connect();

    const { subscription, parentId } = req.body as {
      subscription: ISubscription,
      parentId: string
    };

    await prismaClient.parentPushToken.create({
      data: {
        endpoint: subscription.endpoint,
        parentId: parentId,
        keys: {
          create: {
            ...subscription.keys
          }
        }
      }
    }).then(() => {
      res.status(201).json({
        message: 'Agora você poderá receber mensagens.'
      });
    }).catch(err => {
      console.log(err);
      res.status(500).json({
        message: 'Houve um erro ao configurar o envio de notificações para seu dispositivo.'
      });
    });

    // setTimeout(() => {
    //   webpush.sendNotification(subscription, 'Hello world, push notification');
    // }, 5000)

  },

  async registerManager(req: Request, res: Response) {
    await prismaClient.$connect();

    const { subscription, managerId } = req.body;

    if (typeof (subscription) === 'object') {
      console.log({ message: 'web' });

      res.status(200).json({
        message: 'Okay'
      });
    }

    await prismaClient.manager.update({
      where: { id: managerId },
      data: {
        expoPushToken: subscription
      }
    }).then(resp => {
      res.status(200).json({
        message: 'Notificações ativadas com sucesso.'
      })
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Houve um erro ao ativar as notificações para seu dispositivo.'
      })
    })
  },

  async newSolicitationNotification(req: Request, res: Response) {
    await prismaClient.$connect();
    const { type } = req.body;

    await prismaClient.manager.findMany().then(managers => {
      managers.map(async manager => {
        const notification: ExpoPushMessage[] = [{
          to: manager.expoPushToken,
          sound: 'default',
          body: `Houve uma nova solicitação de ${type}`,
          title: `Nova solicitação de documento!`,
        }]

        await expo.sendPushNotificationsAsync(notification).then(r => {
          res.status(200).json({
            message: 'Notificação enviada com sucesso.'
          });
        }).catch(err => {
          console.error(err);
          res.status(500).json({
            message: 'erro'
          });
        });


      })
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Houve um erro ao enviar a notificação.'
      });
    })
  },

  async sendNewNoticeNotification(req: Request, res: Response) {
    await prismaClient.$connect();
    const { schoolClass, title } = req.body;

    await prismaClient.parent.findMany({
      where: {
        relatives: {
          some: {
            schoolClass
          }
        }
      },
      include: {
        pushToken: {
          include: {
            keys: true
          }
        },
      }
    }).then(parents => {
      const pushTokens = parents.map(parent => {
        return parent.pushToken
      });


      pushTokens.map(parentsPushToken => {
        parentsPushToken.map(parentPushToken => {
          webpush.sendNotification(parentPushToken, title)
        })
      })

      res.status(200).json({
        message: 'Vamo ver mandar notificação do backend'
      });
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Houve um erro ao enviar as notificações.'
      })
    })
  },

  async newParentNotification(req: Request, res: Response) {
    await prismaClient.$connect();

    await prismaClient.manager.findMany().then(managers => {
      managers.map(async manager => {
        const notification: ExpoPushMessage[] = [{
          to: manager.expoPushToken,
          sound: 'default',
          body: `Um novo pais deseja entrar na plataforma, autorize o cadstro dele.`,
          title: `Um novo pai quer se cadastrar!`,
        }]

        await expo.sendPushNotificationsAsync(notification).then(() => {
          console.log({
            message: 'Notificações enviadas com sucesso.'
          })
        }).catch(err => {
          console.error(err);
          // res.status(500).json({
          //   message: 'erro'
          // });
        });
      });

      res.status(200).json({
        message: 'Conta criada com sucesso.'
      });
      return;
    }).catch(err => {
      console.error(err);
      res.status(500).json({
        message: 'Houve um erro ao enviar a notificação.'
      });
    })
  },
}
