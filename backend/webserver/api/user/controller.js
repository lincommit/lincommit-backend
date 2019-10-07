'use strict';

module.exports = (dependencies, lib) => {
  const coreUser = dependencies('coreUser');
  const {
    send404Error,
    send500Error
  } = require('../utils')(dependencies);

  return {
    create,
    get,
    getCurrentUser,
    getRole,
    update,
    list
  };

  /**
   * Create Ticketing user.
   * @param  {Object} req
   * @param  {Object} res
   */
  function create(req, res) {
    const user = req.body;
    const role = req.body.role;

    user.accounts = [{
      type: 'email',
      emails: [user.email],
      hosted: true
    }];
    user.domains = [{
      domain_id: req.domain._id
    }];

    lib.user.create(user)
      .then(createdUser => addUserToContracts(createdUser, role, req.body.contracts || []))
      .then(createdUser => res.status(201).json(denormalize(createdUser)))
      .catch(err => send500Error('Failed to create Ticketing user', err, res));

    function addUserToContracts(user, role, contracts) {
      if (!contracts || !contracts.length) {
        return Promise.resolve(user);
      }

      return Promise.all(contracts.map(contract => lib.contract.addUsers(contract, [{ user: user._id, role }])))
        .then(() => user);
    }

    function denormalize(user) {
      const denormalizedUser = coreUser.denormalize.denormalize(user);

      denormalizedUser.entity = user.entity;

      return denormalizedUser;
    }
  }

  /**
   * Get a user by ID.
   *
   * @param {Request} req
   * @param {Response} res
   */
  function get(req, res) {
    lib.user.getById(req.params.id)
      .then(user => {
        res.status(201).json(user);
      })
      .catch(err => send500Error('Failed to get user', err, res));
  }

  function getCurrentUser(req, res) {
    Promise.all([
      lib.user.getById(req.user._id),
      lib.contract.listForUser(req.user._id)
    ])
    .then(result => {
      const [user, contracts] = result;

      // TODO: Denormalize
      res.status(200).json({ user, contracts });
    })
    .catch(err => send500Error('Failed to get user', err, res));
  }

  /**
   * Update a user. Only allow update main phone and description now.
   * @param  {Object} req
   * @param  {Object} res
   */
  function update(req, res) {
    const modifiedUser = {
      main_phone: req.body.main_phone,
      description: req.body.description
    };

    lib.user.updateById(req.params.id, modifiedUser)
      .then(updatedUser => {
        if (!updatedUser) {
          return send404Error('User not found', res);
        }

        res.status(204).end();
      })
      .catch(err => send500Error('Failed to update Ticketing user', err, res));
  }

  /**
   * List users with entity info.
   *
   * @param {Request} req
   * @param {Response} res
   */
  function list(req, res) {
    let getUsers;
    let errorMessage;

    if (req.query.search) {
      const options = {
        limit: +req.query.limit,
        offset: +req.query.offset,
        search: req.query.search,
        role: req.query.role
      };

      errorMessage = 'Error while searching users';
      getUsers = lib.user.search(options);
    } else {
      const options = {
        limit: +req.query.limit,
        offset: +req.query.offset
      };

      options.populations = [{ path: 'manager' }];

      if (!req.query.organization) {
        options.populations.push({ path: 'organization' });
      }

      errorMessage = 'Failed to list users';
      getUsers = lib.user.list(options)
        .then(users => {
          const denormalizedUsers = users.map(user => {
            const denormalizedUser = coreUser.denormalize.denormalize(user);

            // entity info
            denormalizedUser.entity = user.entity;

            return user;
          });

          return {
            total_count: denormalizedUsers.length,
            list: denormalizedUsers
          };
        });
    }

    return getUsers
      .then(result => {
        res.header('X-ESN-Items-Count', result.total_count);
        res.status(200).json(result.list);
      })
      .catch(err => send500Error(errorMessage, err, res));
  }

  /**
   * Get user role
   *
   * @param {Request} req
   * @param {Response} res
   */
  function getRole(req, res) {
    return lib.ticketingUserRole.getByUser(req.user._id)
      .then(result => {
        if (!result) {
          return send404Error('User not found', res);
        }

        return res.status(200).json(result.role);
      })
      .catch(err => send500Error('Unable to get role', err, res));
  }
};
