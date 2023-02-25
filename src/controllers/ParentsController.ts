import { NextFunction, Request, Response } from 'express';
import prismaClient from '../database/prismaClient';
import * as bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import { parentSchema } from '../yupSchemas/schemas';
import { ValidationError } from "yup";
import { IToken } from '../@types/interfaces';
import path from 'path';
import sendEmail from '../utils/sendEmail';

export default {
  async create(req: Request, res: Response, next: NextFunction) {
    await prismaClient.$connect();
    const {
      fullName,
      email,
      password,
      relatives,
    } = req.body;

    const data = {
      fullName,
      email,
      password,
      relatives,
    };

    await parentSchema.validate(data, {
      abortEarly: false
    }).then(() => {
      bcrypt.hash(password, Number(process.env.SALT_ROUNDS)).then(async (hash) => {
        const parent = {
          fullName,
          email,
          password: hash,
        };

        await prismaClient.parent.create({
          data: {
            ...parent,
            relatives: {
              create: relatives
            }
          }
        }).then(() => {
          next();
          // return;
        }).catch((err) => {
          console.error(err)
          res.status(500).json({
            message: 'Houve um erro interno no servidor.',
            error: err
          })
        });
      }).catch(err => {
        console.error(err)
        res.status(500).json({
          message: 'Houve um erro iterno do servidor.',
          error: err
        });
      });
    }).catch((err: ValidationError) => {
      console.error(err)
      res.status(400).json({
        message: 'Houve um erro na requisição.',
        error: err.errors
      });
    });
  },

  async login(req: Request, res: Response) {
    await prismaClient.$connect();

    const {
      email,
      password
    } = req.body;

    await prismaClient.parent.findFirst({
      where: { email: email },
      include: {
        relatives: true
      }
    }).then(async parent => {
      if (parent) {
        if (parent.accountStatus !== 'actived') {
          return res.status(401).json({
            message: 'Acesso não autorizado.'
          })
        }

        await bcrypt.compare(password, parent?.password).then((result) => {
          if (result) {
            let schoolClasses = <string[]>[]
            parent.relatives.map(relative => {
              schoolClasses.push(relative.schoolClass);
            });
            const token = jwt.encode({ id: parent.id, email: parent.email }, `${process.env.JWT_SECRET}`)
            return res.status(200).json({ token, id: parent.id, schoolClasses });
          }

          return res.status(401).json({
            message: 'Email ou senha incorretos'
          });
        }).catch(err => {
          return res.status(500).json({
            message: 'Houve um erro interno do servidor.',
            errors: err
          });
        });
      } else {
        return res.status(400).json({
          message: 'Email ou senha incorretos',
        });
      };
    });
  },

  async index(req: Request, res: Response) {
    await prismaClient.$connect();

    const { schoolClass } = req.query;

    await prismaClient.parent.findMany({
      where: {
        relatives: {
          some: {
            schoolClass: String(schoolClass)
          }
        },
      },
      include: {
        relatives: {
          where: {
            schoolClass: String(schoolClass)
          }
        },
      },
    }).then((parents) => {
      const parentsView = parents.map(parent => {
        return {
          id: parent.id,
          fullName: parent.fullName,
          email: parent.email,
          relatives: parent.relatives
        }
      });

      return res.status(200).json(parentsView);
    })
  },

  async show(req: Request, res: Response) {
    await prismaClient.$connect();

    const { id } = req.params;

    await prismaClient.parent.findUnique({
      where: { id }
    }).then(parent => {
      return res.status(200).json({
        fullName: parent?.fullName,
        email: parent?.email
      });
    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Houve um erro interno do servidor. Por favor, tente novamente mais tarde.'
      })
    })
  },

  async updatePassword(req: Request, res: Response) {
    await prismaClient.$connect();
    const { id } = req.params;
    const { password, newPassword } = req.body;
    const encriptedPassword = await bcrypt.hash(newPassword, Number(process.env.SALT_ROUNDS));

    const parent = await prismaClient.parent.findUnique({
      where: { id }
    });

    if (!parent) {
      return res.status(400).json({
        message: 'Não foi possível encontrar a conta para alterar os dados. Tente novamente mais tarde.'
      })
    };

    const verified = await bcrypt.compare(password, parent?.password)

    if (!verified) {
      console.log('Senha incorreta');
      return res.status(401).json({
        message: 'Senha incorreta.'
      });
    };

    await prismaClient.parent.update({
      where: { id },
      data: {
        password: encriptedPassword
      }
    }).then(parent => {
      const token = jwt.encode({ id: parent.id, email: parent.email }, `${process.env.JWT_SECRET}`);
      return res.status(200).json({ token: token });
    }).catch(err => {
      console.log(err);
      return res.status(500).json({
        message: 'Houve um erro ao salvar sua senha. Tente novamente mais tarde.'
      })
    });
  },

  async authorize(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Não foi possível encontrar a conta solicitada para autorizá-la'
      });
    } else {
      await prismaClient.parent.update({
        where: { id },
        data: {
          accountStatus: 'unvalidated'
        }
      }).then((parent) => {
        const token = jwt.encode({ id: parent.id, email: parent.email }, `${process.env.JWT_SECRET}`);
        sendEmail(parent.fullName, parent.email, `${process.env.BASE_URL}/validate/parent/${token}`);

        return res.status(200).json({
          message: 'Conta autorizada com sucesso. Agora um email foi enviado para o responsável para que ele valide sua conta.'
        });
      }).catch(err => {
        console.error(err);
        return res.status(500).json({
          message: 'Houve um erro interno do servidor. Por favor tente novamente mais tarde.'
        });
      });
    }
  },

  async listNonAuthParents(req: Request, res: Response) {
    await prismaClient.$connect();

    await prismaClient.parent.findMany({
      where: {
        accountStatus: 'unauthorized'
      },
      include: {
        relatives: true
      }
    }).then(unauthorizedParents => {
      return res.status(200).json(unauthorizedParents);
    }).catch(err => {
      console.error(err);
      return res.status(500).json({
        message: 'Houve um erro interno do servidor. Tente novamente mais tarde.'
      })
    })
  },

  async validate(req: Request, res: Response) {
    const { token } = req.params;
    const decodedToken: IToken = await jwt.decode(`${token}`, `${process.env.JWT_SECRET}`);

    const parent = await prismaClient.parent.findUnique({
      where: { id: decodedToken.id }
    });

    if (!parent) {
      console.log({ message: 'Conta não encontrada.' })
      return res.sendFile(path.join(__dirname, '..', '..', 'public', 'validate', 'error.html'));
    };

    if (parent.accountStatus === 'actived') {
      return res.sendFile(path.join(__dirname, '..', '..', 'public', 'validate', 'success.html'));
    };

    if (parent.accountStatus !== 'unvalidated') {
      console.log({ message: 'Para ativar a conta, é necessário que o status atual seja de não validada', status: parent.accountStatus })
      return res.sendFile(path.join(__dirname, '..', '..', 'public', 'validate', 'error.html'));
    };

    if (parent?.email != decodedToken.email) {
      return res.status(401).json({
        message: 'Acesso não autorizado.'
      });
    }

    await prismaClient.parent.update({
      where: { id: decodedToken.id },
      data: {
        accountStatus: 'actived'
      }
    }).then(() => {
      return res.sendFile(path.join(__dirname, '..', '..', 'public', 'validate', 'success.html'));
    }).catch(err => {
      console.error(err);
      return res.status(500).sendFile(path.join(__dirname, '..', '..', 'public', 'validate', 'error.html'));
    });
  },
};