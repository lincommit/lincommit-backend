module.exports = dependencies => {
  const emailModule = dependencies('email');
  const userModule = dependencies('coreUser');
  const EsnConfig = dependencies('esn-config').EsnConfig;

  const logger = dependencies('logger');
  const { EMAIL_NOTIFICATIONS } = require('../constants');
  const i18n = require('../i18n')(dependencies);
  const path = require('path');
  const TEMPLATE_PATH = path.resolve(__dirname, '../../templates/email');

  return {
    send
  };

  function getTicketUrl(ticket, frontendUrl) {
    let ticketUrl = '';

    try {
      ticketUrl = new URL(`requests/${ticket._id}`, frontendUrl).toString();
    } catch (e) {
      logger.warn(`Invalid ticket url, please check that ticketing08000linux.backend.frontendUrl configuration is set with a valid url (current url: ${frontendUrl})`, e);
    }

    return ticketUrl;
  }

  function getRecipients(ticket, defaultResponsibleEmail) {
    const to = [];
    const cc = ticket.participants && [...ticket.participants];

    ticket.author && ticket.author.email && to.push(ticket.author.email);
    ticket.assignedTo && ticket.assignedTo.email && to.push(ticket.assignedTo.email);

    if (ticket.responsible && ticket.responsible.email) {
      to.push(ticket.responsible.email);
    } else {
      to.push(defaultResponsibleEmail || EMAIL_NOTIFICATIONS.DEFAULT_RESPONSIBLE_EMAIL);
    }

    return { to: to, cc: cc };
  }

  function getTemplateContent(ticket, event, frontendUrl) {
    const translatedStatus = i18n.__(ticket.status);
    const ticketUrl = getTicketUrl(ticket, frontendUrl);

    return {ticket, event, ticketUrl, status: translatedStatus};
  }

  function getConfig() {
    return new EsnConfig('ticketing08000linux.backend')
      .getMultiple(['frontendUrl', 'mail'])
      .spread((frontendUrl, mail) => ({
        frontendUrl: frontendUrl && frontendUrl.value,
        mail: mail && mail.value
      }));
  }

  function send(emailType, ticket, event) {
    return getConfig()
      .then(({ frontendUrl, mail }) => {
        userModule.get(ticket.author.id, (err, user) => {
          if (err || !user) {
            return logError(err || `User ${ticket.author.id} not found`);
          }

          const content = getTemplateContent(ticket, event, frontendUrl);
          const recipients = getRecipients(ticket, mail.support);

          const message = {
            subject: i18n.__(emailType.subject, content),
            to: recipients.to,
            cc: recipients.cc,
            from: mail.noreply,
            replyTo: mail.replyto
          };

          return emailModule.getMailer(user).sendHTML(
            message,
            { name: emailType.template, path: TEMPLATE_PATH },
            { content, translate: (phrase, parameters) => i18n.__(phrase, parameters) },
            logError
          );
        });
      })
      .catch(logError);
  }

  function logError(err) {
    if (err) {
      logger.error('Unable to send notification email', err);
    }
  }
};
