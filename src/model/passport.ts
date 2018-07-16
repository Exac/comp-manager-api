import * as express from 'express'
/**
 * Middle-ware to ensure the user is logged in. 
 * Redirects user if not logged in.
 * 
 * @param req Express request
 * @param res Express response
 * @param next Callback function
 * @example `import { ensureLoggedIn } from 'model/passport';`
 * @example `app.get('/profile', ensureLoggedIn, (req, res) => {res.write("juice user data")})`
 */
export function ensureLoggedIn(req: express.Request, res: express.Response, next: any) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login;message=Login timed out.");
  }

