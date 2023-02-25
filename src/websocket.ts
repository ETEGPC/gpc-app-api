import { io } from "./http";
import { IMessage } from "./@types/interfaces";
import prismaClient from "./database/prismaClient";
import { Notice, Event } from "@prisma/client";
import webpush from 'web-push';
import { Expo, ExpoPushMessage } from "expo-server-sdk";

let expo = new Expo();

webpush.setVapidDetails(
  `${process.env.PUSH_NOTIFICATION_URL}`,
  'BKqNcUViP-4xKjL6_Smp3vRTUQWjTByIABcKpRO-Ho6zaHVBDS0qBfCLlxyWUT_a0QslPrbHO5WNF8yDVdkpKEw',
  `${process.env.PUSH_NOTIFICATION_PRIVATE_KEY}`
);

io.on('connection', async (socket) => {
  await prismaClient.$connect();

  console.log({
    message: 'Hello World, a new user connected',
  });

  socket.on('notice', (notice: Notice) => {
    io.emit(`new_notice_${notice.schoolClass}`, {
      ...notice
    });
  });

  socket.on('event', (event: Event) => {
    io.emit('new_event', {
      ...event
    });
  });

  socket.on('message', async (message: IMessage) => {
    await prismaClient.message.create({
      data: message
    }).then(async (resp) => {

      if (message.room.includes(message.author)) {
        const managers = await prismaClient.manager.findMany();
        const parent = await prismaClient.parent.findUnique({
          where: { id: message.author },
          include: {
            relatives: true
          }
        });

        const schoolClasses = parent?.relatives.map(relative => {
          return relative.schoolClass
        })


        managers.map(async manager => {
          const notification: ExpoPushMessage[] = [{
            to: manager.expoPushToken,
            sound: 'default',
            body: `${message.message}`,
            title: `${parent?.fullName} - ${JSON.stringify(schoolClasses)}`,
          }]

          await expo.sendPushNotificationsAsync(notification);
        });

      } else if (!message.room.includes(message.author)) {
        const parentId = message.room.split('-')[0];

        const parent = await prismaClient.parent.findUnique({
          where: { id: parentId },
          include: {
            pushToken: {
              include: {
                keys: true
              }
            }
          }
        });

        console.log(parent);

        parent?.pushToken.map(pushtoken => {
          webpush.sendNotification(pushtoken, message.message);
        });

        //console.log(parentId)
      }

      io.emit(`${message.room}`, resp);
    })
  })
});