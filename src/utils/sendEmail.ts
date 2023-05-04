import sgMail from '@sendgrid/mail';

async function sendEmail(parentName: string, parentEmail: string, validationLink: string) {
  sgMail.setApiKey(`${process.env.SENDGRID_API_KEY}`);

  const msg = {
    from: `${process.env.SENDGRID_FROM_EMAIL}`,
    to: parentEmail,
    subject: 'Valide sua conta',
    html: `
    <h1>Olá, ${parentName}!</h1>
    <h2>Sua conta foi autorizada pela gestão, agora você deve validar acessando o link abaixo:</h2>
    <a href="${validationLink}" >
      Clique aqui!
    </a>
    `
  };

  const res = await sgMail.send(msg, false, (err, resp) => {
    if (err) {
      return err
    };

    return resp
  })

  return res;
};

async function sendRecoverEmailToParent(parentEmail: string, recoverLink: string) {
  sgMail.setApiKey(`${process.env.SENDGRID_API_KEY}`);

  const msg = {
    from: `${process.env.SENDGRID_FROM_EMAIL}`,
    to: parentEmail,
    subject: 'Pedido de recuperação de senha',
    html: `
    <h1>Olá, aqui está seu link de recuperação de senha!</h1>
    <h2>Você fez um pedido de recuperar senha na sua conta de pai na escola do Ginásio Pernambucano. Caso não tenha sido você, entre em contato com a escola para informar. Abaixo está o link para recuperar sua senha.</h2>
    <a href="${recoverLink}" >
      Clique aqui!
    </a>
    `
  };

  const res = await sgMail.send(msg, false, (err, resp) => {
    if (err) {
      return err
    };

    return resp
  })

  return res;
}

export {
  sendEmail,
  sendRecoverEmailToParent
};