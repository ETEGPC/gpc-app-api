import { Request, response, Response } from "express";
import prismaClient from "../database/prismaClient";
import * as bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import { managerSchema } from '../yupSchemas/schemas';
import { ValidationError } from "yup";
import { IToken } from "../@types/interfaces";

export default {
  async create(req: Request, res: Response) {
    await prismaClient.$connect();

    const {
      name,
      lastname,
      email,
      password,
      pushToken
    } = req.body;

    const data = {
      name,
      lastname,
      email,
      password
    };

    managerSchema.validate(data, {
      abortEarly: false
    }).then(() => {
      bcrypt.hash(password, Number(process.env.SALT_ROUNDS)).then(async (hash) => {
        const manager = {
          name,
          lastname,
          email,
          password: hash,
          pushToken
        };

        await prismaClient.manager.create({
          data: manager
        }).then((resp) => {
          const token = jwt.encode({ id: resp.id, email: resp.email }, `${process.env.JWT_SECRET}`);
          return res.status(201).json({ token: token });
        }).catch((err) => {
          return res.status(500).json({
            message: 'Houve um erro interno do servidor.',
            error: err
          });
        })
      });
    }).catch((err: ValidationError) => {
      return res.status(400).json({
        message: 'Houve um erro na requisição.',
        errors: err.errors
      });
    });
  },

  async login(req: Request, res: Response) {
    await prismaClient.$connect();

    const { email, password } = req.body;

    await prismaClient.manager.findFirst({
      where: { email: email }
    }).then(async manager => {
      if (manager) {
        await bcrypt.compare(password, manager?.password).then((result) => {
          if (result) {
            const token = jwt.encode({ id: manager.id, email: manager.email }, `${process.env.JWT_SECRET}`)
            return res.status(200).json({ token, id: manager.id });
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

  async update(req: Request, res: Response) {
    await prismaClient.$connect();
    const { id } = req.params;
    const { password, newPassword } = req.body;
    const encriptedPassword = await bcrypt.hash(newPassword, Number(process.env.SALT_ROUNDS));

    const manager = await prismaClient.manager.findUnique({
      where: { id }
    });

    if (!manager) {
      return res.status(400).json({
        message: 'Não foi possível encontrar a conta para alterar os dados. Tente novamente mais tarde.'
      })
    };

    const verified = await bcrypt.compare(password, manager?.password)

    if (!verified) {
      console.log('Senha incorreta');
      return res.status(401).json({
        message: 'Senha incorreta.'
      });
    };

    await prismaClient.manager.update({
      where: { id },
      data: {
        password: encriptedPassword
      }
    }).then(manager => {
      const token = jwt.encode({ id: manager.id, email: manager.email }, `${process.env.JWT_SECRET}`);
      return res.status(200).json({ token: token });
    }).catch(err => {
      console.log(err);
      return res.status(500).json({
        message: 'Houve um erro ao salvar sua senha. Tente novamente mais tarde.'
      })
    });
  }
};

// await prismaClient.manager.findUnique({
//   where: { id }
// }).then(async manager => {
//   if (manager) {
//     await bcrypt.compare(password, manager.password).then(async equal => {
//       if (equal) {
//         await bcrypt.hash(newPassword, Number(process.env.SALT_ROUNDS)).then(async hash => {
//           await prismaClient.manager.update({
//             where: { id },
//             data: {
//               password: hash
//             }
//           }).then((manager) => {
//             const token = jwt.encode({ id: manager.id, email: manager.email }, `${process.env.JWT_SECRET}`);
//             return res.status(200).json({ token: token });
//           }).catch(err => {
//             console.error(err);
//             return res.status(500).json({
//               message: 'Houve um erro ao salvar sua senha. Tente novamente mais tarde.'
//             });
//           });

//         }).catch(err => {
//           console.error(err);
//           return res.status(500).json({
//             message: 'Houve um erro ao salvar sua senha. Tente novamente mais tarde.'
//           });
//         });
//       }

//       return res.status(401).json({
//         message: 'Não foi possível autenticar seus dados. Tente novamente mais tarde.'
//       })
//     }).catch(err => {
//       console.error(err);
//       return res.status(401).json({
//         message: 'Não foi possível autenticar suas credenciais. Tente novamente mais tarde.'
//       });
//     })
//   };

//   return res.status(400).json({
//     message: 'Não foi possível achar a conta selecionada para alterar a senha'
//   });



// }).catch(err => {
//   console.error(err);
//   return response.status(500).json({
//     message: 'Houve um erro interno do servidor.'
//   });
// });