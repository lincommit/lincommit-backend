'use strict';

module.exports = function(dependencies, lib) {
  const { send500Error, send404Error } = require('../utils')(dependencies);
  const logger = dependencies('logger');

  return {
    addEvent,
    create,
    list,
    get,
    update,
    remove
  };

  function addEvent(req, res) {
    const event = req.body;
    const ticketId = req.params.id;

    lib.ticket.addEvent(ticketId, event)
      .then(updatedTicket => {
        res.status(200).json(updatedTicket);
      })
      .catch(err => send500Error('failed to add event', err, res));
  }

  /**
   * Create a ticket.
   *
   * @param {Request} req
   * @param {Response} res
   */
  function create(req, res) {
    const ticket = res.locals.newTicket;

    if (!ticket) {
      return res.status(500).json('Something went wrong');
    }

    return lib.ticket.create(ticket)
      .then(createdTicket => res.status(201).json(createdTicket))
      .catch(err => send500Error('Failed to create ticket', err, res));
  }

  /**
   * List tickets.
   *
   * @param {Request} req
   * @param {Response} res
   */
  function list(req, res) {
    const userType = req.ticketingUser && req.ticketingUser.type;
    let options = {
      limit: +req.query.limit,
      offset: +req.query.offset
    };

    lib.ticketingUserRole.userIsAdministrator(req.user._id)
      .then(isAdmin => (isAdmin || (userType === 'expert')))
      .then(canViewAll => (canViewAll ? _listAll() : _listForUser(req.user._id)))
      .then(({ size, list }) => {
        res.header('X-ESN-Items-Count', size);
        res.status(200).json(list);
      })
      .catch(err => send500Error('Error while getting tickets', err, res));

    function _listAll() {
      return lib.ticket.list();
    }

    function _listForUser(_id) {
      options = {...options, userType};

      return lib.contract.listForUser(_id)
        .then(contracts => {
          if (!contracts || !contracts.length) {
            logger.info('No contracts for user', req.user._id);
          }

          return contracts.map(contract => contract.contract);
        })
        .then(contracts => lib.ticket.listForContracts(contracts, options));
      }
  }

  /**
   * Get a ticket
   *
   * @param {Request} req
   * @param {Response} res
   */
  function get(req, res) {
    return lib.ticket.getById(req.params.id)
      .then(ticket => {
        ticket = ticket.toObject();

        lib.ticketingUserRole.userIsAdministrator(req.user._id)
        .then(isAdmin => (isAdmin || (req.ticketingUser && req.ticketingUser.type === 'expert')))
        .then(canReadPrivateComment => {
          if (!canReadPrivateComment) {
            ticket.events = ticket.events.filter(event => !event.isPrivate);
          }

          return res.status(200).json(ticket);
        });
      })
      .catch(err => send500Error('Failed to get ticket', err, res));
  }

  /**
   * Update a ticket
   *
   * @param {Request} req
   * @param {Response} res
   */
  function update(req, res) {
    const ticket = req.body;
    const ticketId = req.params.id;
    const ticketingUser = req.ticketingUser;

    lib.ticket.updateById(ticketId, ticket, ticketingUser)
      .then(updatedTicket => {
        res.status(200).json(updatedTicket);
      })
      .catch(err => send500Error('failed to update ticket', err, res));
  }

/**
 * Delete a ticket
 *
 * @param {Request} req
 * @param {Response} res
 */
  function remove(req, res) {
    return lib.ticket.removeById(req.params.id)
      .then(deletedTicket => {
        if (deletedTicket) {
          return res.status(204).end();
        }

        return send404Error('ticket not found', res);
      })
      .catch(err => send500Error('Failed to delete ticket', err, res));
  }
};
