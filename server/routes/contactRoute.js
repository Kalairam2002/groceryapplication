import express from 'express';
import { createContact,getAllContacts } from '../controllers/contactController.js';

const contactRouter = express.Router();

contactRouter.post("/", createContact);
contactRouter.get("/", getAllContacts);

export default contactRouter;