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

export default sendEmail;