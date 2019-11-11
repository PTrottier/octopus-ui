const debug = require('debug');

const api = require('../../lib/api');

module.exports = (req, res) => {
  const publicationID = req.params.publicationID;
  debug('octopus:ui:debug')(`Showing Publication ${publicationID}`);

  return api.getPublicationByID(publicationID, (publicationErr, publication) => {
    if (publicationErr || !publication) {
      debug('octopus:ui:error')(`Error when trying to load Publication ${publicationID}: ${publicationErr}`);
      return res.render('publications/error');
    }

    if (publication.status === 'DRAFT') {
      // TODO check if user is on the list of collaborators - otherwise error / a new "not-yet-published" screen
      req.flash('info', 'This publication has still not been published. Redirecting to edit mode.');
      return res.redirect(`/publications/edit/${publicationID}`);
    }

    res.locals.publication = publication;

    // debug('octopus:ui:trace')(res.locals);
    return res.render('publications/view', res.locals);
  });
};
