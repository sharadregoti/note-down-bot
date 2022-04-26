import express from 'express';
import oauthCont from '../controllers/oauth.controller';

const router = express.Router();
router.get('/', oauthCont.redirectCallback);

export default router