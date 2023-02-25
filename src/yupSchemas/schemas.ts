import { string, number, object, date } from 'yup';

const managerSchema = object({
  name: string().required('O campo nome é obrigatório.'),
  lastname: string().required('O campo sobrenome é obrigatório.'),
  email: string().required('O campo email é obrigatório.'),
  password: string().required('O campo senha é obrigatório.')
});

const parentSchema = object({
  fullName: string().required('O campo nome completo é obrigatório'),
  email: string().required('O campo email é obrigatório.'),
  password: string().required('O campo senha é obrigatório.')
});

const noticeSchema = object({
  title: string().required('O campo de título do aviso é obrigatório.'),
  description: string().required('O campo de descrição do aviso é obrigatório.'),
  schoolClass: string().required('O campo de turma do aviso é obrigatório.')
});

const eventSchema = object({
  title: string().required('O campo de título é obrigatório'),
  description: string().required('O campo de descrição é obrigatório.'),
  date: date().required('O campo de data é obrigatório.')
});

const solicitationSchema = object({
  type: string().required('O campo tipo de documento é obrigatório'),
  student: string().required('O campo aluno é obrigatório.'),
  status: string().required(),
  schoolClass: string().required('O campo turma é obrigatório.')
});

const scheduleSchema = object({
  schoolClass: string().required('O campo turma é obrigatório.')
});

const newsSchema = object({
  title: string().required('O título da notícia é obrigatório.'),
  url: string().required('O título da notícia é obrigatório.'),
  date: date().required('O campo data é obrigatório.')
  // dado1: string().required('Campo dado1 é obrigatório'),
  // dado2: string().required('Campo dado 2 obrigatório também para o teste.')
});

export {
  managerSchema,
  parentSchema,
  noticeSchema,
  eventSchema,
  solicitationSchema,
  scheduleSchema,
  newsSchema
};