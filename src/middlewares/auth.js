'use strict';
const { Op } = require('sequelize');

const jwt = require('jsonwebtoken');
const db = require('../models');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'dumbKey';

// FIX - wrap catchAsync but throwing a 401?
const authMiddleware = async (req, res, next) => {
  // extract token from auth headers
  // eslint-disable-next-line @typescript-eslint/dot-notation
  const authHeaders = req.headers['authorization'];
  if (!authHeaders) {
    // FIX - TODO - Should we throw AppError or just sendStatus
    return res.sendStatus(403);
  }
  const token = authHeaders.split(' ')[1];

  try {
    // verify & decode token payload,
    const { id } = jwt.verify(token, JWT_SECRET_KEY);
    // attempt to find user object and set to req
    // Should this query be much simpler and then in getUser query the rest of the stuff. Otherwise we are querying everything each time we want to authenticate
    const user = await db.user.findOne({
      where: { [Op.and]: [{ id }, { hasConfirmed: true }] },
      attributes: ['id', 'email', 'name', 'type'],
    });

    // FIX - TODO - Should we throw AppError or just sendStatus
    if (!user) return res.sendStatus(401);
    req.user = user;
    next();
  } catch (error) {
    res.sendStatus(401);
  }
};

module.exports = authMiddleware;
